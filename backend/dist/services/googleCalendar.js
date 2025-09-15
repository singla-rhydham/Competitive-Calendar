"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const User_js_1 = __importDefault(require("../models/User.js"));
const Contest_js_1 = __importDefault(require("../models/Contest.js"));
class GoogleCalendarService {
    constructor() {
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    }
    async addContestsToUserCalendar(userId) {
        try {
            const user = await User_js_1.default.findById(userId);
            if (!user) {
                return { success: false, message: 'User not found', addedCount: 0 };
            }
            if (!user.refreshToken) {
                return { success: false, message: 'User not authenticated with Google Calendar', addedCount: 0 };
            }
            // Set credentials
            this.oauth2Client.setCredentials({
                refresh_token: user.refreshToken
            });
            // Get upcoming contests
            const upcomingContests = await Contest_js_1.default.find({
                startTime: { $gte: new Date() }
            }).sort({ startTime: 1 });
            if (upcomingContests.length === 0) {
                return { success: true, message: 'No upcoming contests found', addedCount: 0 };
            }
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
            let addedCount = 0;
            for (const contest of upcomingContests) {
                try {
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
                            overrides: [
                                { method: 'popup', minutes: 60 }, // 1 hour before
                                { method: 'popup', minutes: 10 }, // 10 minutes before
                            ],
                        },
                        colorId: this.getColorIdForPlatform(contest.platform),
                    };
                    await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: event,
                    });
                    addedCount++;
                }
                catch (error) {
                    console.error(`Error adding contest ${contest.id} to calendar:`, error);
                    // Continue with other contests even if one fails
                }
            }
            return {
                success: true,
                message: `Successfully added ${addedCount} contests to your Google Calendar!`,
                addedCount
            };
        }
        catch (error) {
            console.error('Error adding contests to calendar:', error);
            return { success: false, message: 'Failed to add contests to calendar', addedCount: 0 };
        }
    }
    async removeContestsFromUserCalendar(userId) {
        try {
            const user = await User_js_1.default.findById(userId);
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
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
            // Get all events from the calendar
            const events = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: 1000,
                singleEvents: true,
                orderBy: 'startTime',
            });
            const contestEvents = events.data.items?.filter(event => event.summary?.includes('Codeforces:') ||
                event.summary?.includes('LeetCode:') ||
                event.summary?.includes('AtCoder:') ||
                event.summary?.includes('CodeChef:')) || [];
            let removedCount = 0;
            for (const event of contestEvents) {
                if (event.id) {
                    try {
                        await calendar.events.delete({
                            calendarId: 'primary',
                            eventId: event.id,
                        });
                        removedCount++;
                    }
                    catch (error) {
                        console.error(`Error removing event ${event.id}:`, error);
                    }
                }
            }
            return {
                success: true,
                message: `Successfully removed ${removedCount} contest events from your Google Calendar.`
            };
        }
        catch (error) {
            console.error('Error removing contests from calendar:', error);
            return { success: false, message: 'Failed to remove contests from calendar' };
        }
    }
    getColorIdForPlatform(platform) {
        const colorMap = {
            'Codeforces': '1', // Red
            'LeetCode': '2', // Orange
            'AtCoder': '3', // Yellow
            'CodeChef': '4', // Green
        };
        return colorMap[platform] || '1';
    }
    async syncContestsForSubscribedUsers() {
        try {
            const subscribedUsers = await User_js_1.default.find({ subscribed: true });
            console.log(`Syncing contests for ${subscribedUsers.length} subscribed users`);
            for (const user of subscribedUsers) {
                try {
                    await this.addContestsToUserCalendar(String(user._id));
                }
                catch (error) {
                    console.error(`Error syncing contests for user ${user._id}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error syncing contests for subscribed users:', error);
        }
    }
}
exports.default = new GoogleCalendarService();
