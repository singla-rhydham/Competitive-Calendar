import { google } from 'googleapis';
import moment from 'moment-timezone';
import User from '../models/User.js';
import Contest from '../models/Contest.js';

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

      // Get existing events from Google Calendar to check for duplicates
      const existingContestKeys = await this.getExistingContestKeys(calendar);

      for (const contest of upcomingContests) {
        try {
          // Skip if already mapped for this user and contest
          if (existingContestKeys.has(contest.id)) {
            continue;
          }

          const minutes = this.mapReminderPreferenceToMinutes(user.reminderPreference);
          const userTimeZone = user.timeZone || 'Asia/Kolkata';
          const event = {
            summary: `${contest.platform}: ${contest.name}`,
            description: `Coding contest on ${contest.platform}\n\nContest URL: ${contest.url}\n\nGood luck! 🚀`,
            start: {
              dateTime: moment(contest.startTime).tz(userTimeZone).format(),
              timeZone: userTimeZone,
            },
            end: {
              dateTime: moment(contest.endTime).tz(userTimeZone).format(),
              timeZone: userTimeZone,
            },
            source: {
              title: contest.platform,
              url: contest.url,
            },
            extendedProperties: {
              private: {
                contestKey: contest.id
              }
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
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
      }); 

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Get all events from Google Calendar that were created by our app
      const contestEvents = await this.getContestEventsFromCalendar(calendar);
      
      let attempted = 0;
      let removedCount = 0;
      const errors: { eventId: string; message: string }[] = [];

      for (const event of contestEvents) {
        const eventId = event.id;
        if (!eventId) continue;

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

      if (errors.length > 0) {
        return {
          success: false,
          message: `Removed ${removedCount}/${attempted} events. Some deletions failed.`
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

  /**
   * Get existing contest keys from Google Calendar events
   */
  private async getExistingContestKeys(calendar: any): Promise<Set<string>> {
    try {
      const events = await this.getContestEventsFromCalendar(calendar);
      const contestKeys = new Set<string>();
      
      for (const event of events) {
        const contestKey = event.extendedProperties?.private?.contestKey;
        if (contestKey) {
          contestKeys.add(contestKey);
        }
      }
      
      return contestKeys;
    } catch (error) {
      console.error('Error getting existing contest keys:', error);
      return new Set();
    }
  }

  /**
   * Get all contest events from Google Calendar that were created by our app
   */
  private async getContestEventsFromCalendar(calendar: any): Promise<any[]> {
    try {
      // Get events from the past month to current + 6 months to cover all contest events
      const timeMin = moment().subtract(1, 'month').toISOString();
      const timeMax = moment().add(6, 'months').toISOString();
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        maxResults: 2500, // Increase limit to get more events
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      
      // Filter events that have our contestKey in extendedProperties
      return events.filter((event: any) => 
        event.extendedProperties?.private?.contestKey
      );
    } catch (error) {
      console.error('Error getting contest events from calendar:', error);
      return [];
    }
  }
}

export default new GoogleCalendarService();
