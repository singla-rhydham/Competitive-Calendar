import { google } from 'googleapis';
import User from '../models/User.js';
import Contest from '../models/Contest.js';
import UserCalendarEvent from '../models/UserCalendarEvent.js';

class GoogleCalendarService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  async addContestsToUserCalendar(userId: string): Promise<{ success: boolean; message: string; addedCount: number }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found', addedCount: 0 };
      }

      if (!user.refreshToken) {
        return { success: false, message: 'User not authenticated with Google Calendar', addedCount: 0 };
      }

      // Set credentials
      this.oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken
      });

      // Get upcoming contests, filtered by user's selected platforms
      const platformFilter = Array.isArray(user.platforms) && user.platforms.length > 0 ? { platform: { $in: user.platforms } } : {};
      const upcomingContests = await Contest.find({
        startTime: { $gte: new Date() },
        ...platformFilter
      }).sort({ startTime: 1 });

      if (upcomingContests.length === 0) {
        return { success: true, message: 'No upcoming contests found', addedCount: 0 };
      }

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      let addedCount = 0;

      // Preload existing mappings for fast duplicate checks
      const existingMappings = await UserCalendarEvent.find({ userId }).lean();
      const existingContestKeys = new Set(existingMappings.map(m => m.contestKey));

      for (const contest of upcomingContests) {
        try {
          // Skip if already mapped for this user and contest
          if (existingContestKeys.has(contest.id)) {
            continue;
          }

          const minutes = this.mapReminderPreferenceToMinutes(user.reminderPreference);
          const event = {
            summary: `${contest.platform}: ${contest.name}`,
            description: `Coding contest on ${contest.platform}\n\nContest URL: ${contest.url}\n\nGood luck! 🚀`,
            start: {
              dateTime: contest.startTime.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: contest.endTime.toISOString(),
              timeZone: 'UTC',
            },
            source: {
              title: contest.platform,
              url: contest.url,
            },
            reminders: {
              useDefault: false,
              overrides: minutes.length ? minutes.map((m) => ({ method: 'popup', minutes: m })) : [{ method: 'popup', minutes: 60 }],
            },
            colorId: this.getColorIdForPlatform(contest.platform, user.platformColors),
          };

          const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
          });

          const googleEventId = response.data.id;
          if (googleEventId) {
            await UserCalendarEvent.create({
              userId,
              contestId: contest._id,
              contestKey: contest.id,
              googleEventId
            });
            addedCount++;
          }
        } catch (error) {
          const err = error as any;
          console.error(`Error adding contest ${contest.id} to calendar:`, {
            message: err?.message,
            code: err?.code,
            errors: err?.errors,
            responseStatus: err?.response?.status,
            responseData: err?.response?.data,
          });
          // Continue with other contests even if one fails
        }
      }

      return {
        success: true,
        message: `Successfully added ${addedCount} contests to your Google Calendar!`,
        addedCount
      };
    } catch (error) {
      console.error('Error adding contests to calendar:', error);
      return { success: false, message: 'Failed to add contests to calendar', addedCount: 0 };
    }
  }

  async removeContestsFromUserCalendar(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.refreshToken) {
        return { success: false, message: 'User not authenticated with Google Calendar' };
      }

      // Set credentials
      this.oauth2Client.setCredentials({
        refresh_token: user.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Load mappings and ensure we only target events we created with valid googleEventId
      const mappings = await UserCalendarEvent.find({ userId }).lean();
      const mappingsWithEventId = mappings.filter(m => !!m.googleEventId);

      // Validate contests still exist (extra safeguard)
      const contestIds = mappingsWithEventId.map(m => m.contestId).filter(Boolean) as any[];
      const existingContests = contestIds.length ? await Contest.find({ _id: { $in: contestIds } }, { _id: 1 }).lean() : [];
      const validContestIdSet = new Set(existingContests.map(c => String(c._id)));

      let attempted = 0;
      let removedCount = 0;
      let skippedNoId = 0;
      let skippedNoContest = 0;
      const errors: { eventId: string; message: string }[] = [];

      for (const mapping of mappingsWithEventId) {
        const eventId = mapping.googleEventId as unknown as string;
        const contestIdStr = String(mapping.contestId || '');

        // Only delete if contest still exists in DB (as requested safeguard)
        if (contestIdStr && !validContestIdSet.has(contestIdStr)) {
          skippedNoContest++;
          continue;
        }

        attempted++;
        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId
          });
          removedCount++;
        } catch (error) {
          const err = error as any;
          const message = err?.message || err?.response?.data || 'Unknown error';
          // If event not found (already deleted), we treat as non-fatal and continue
          if (err?.code !== 404) {
            console.error(`Failed to delete event ${eventId}:`, message);
            errors.push({ eventId, message: typeof message === 'string' ? message : JSON.stringify(message) });
          }
        }
      }

      // Cleanup mappings for this user regardless of delete outcomes
      await UserCalendarEvent.deleteMany({ userId });

      if (errors.length > 0) {
        return {
          success: false,
          message: `Removed ${removedCount}/${attempted} events. ${skippedNoId + skippedNoContest} skipped. Some deletions failed.`
        };
      }

      return {
        success: true,
        message: `Successfully removed ${removedCount} contest events from your Google Calendar.`
      };
    } catch (error) {
      console.error('Error removing contests from calendar:', error);
      return { success: false, message: 'Failed to remove contests from calendar' };
    }
  }

  private getColorIdForPlatform(platform: string, userColorMap?: { [key: string]: string }): string {
    if (userColorMap && userColorMap[platform]) return userColorMap[platform];
    const defaultColorMap: { [key: string]: string } = {
      'Codeforces': '1',
      'LeetCode': '2',
      'AtCoder': '3',
      'CodeChef': '4',
    };
    return defaultColorMap[platform] || '1';
  }

  private mapReminderPreferenceToMinutes(pref?: string): number[] {
    switch (pref) {
      case '10m':
        return [10];
      case '30m':
        return [30];
      case '1h':
        return [60];
      case '2h':
        return [120];
      default:
        return [60];
    }
  }

  async syncContestsForSubscribedUsers(): Promise<void> {
    try {
      const subscribedUsers = await User.find({ subscribed: true });
      console.log(`Syncing contests for ${subscribedUsers.length} subscribed users`);

      for (const user of subscribedUsers) {
        try {
          await this.addContestsToUserCalendar(String(user._id));
        } catch (error) {
          console.error(`Error syncing contests for user ${user._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing contests for subscribed users:', error);
    }
  }
}

export default new GoogleCalendarService();
