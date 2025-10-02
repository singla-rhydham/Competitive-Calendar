import axios from 'axios';
import * as cheerio from 'cheerio';
import Contest from '../models/Contest.js';
import cron from 'node-cron';
import googleCalendarService from './googleCalendar.js';
import { DateTime } from 'luxon';

interface ContestData {
  id: string;
  platform: string;
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
}

class ContestUpdater {
  private isRunning = false;

  constructor() {
    // Run every 6 hours (disabled in production; will be triggered via GH Actions hitting a backend endpoint)
    if (process.env.NODE_ENV !== 'production') {
      cron.schedule('0 */6 * * *', () => {
        console.log('Running scheduled contest update...');
        this.updateContests();
      });
    }
  }

  async updateContests(): Promise<void> {
    if (this.isRunning) {
      console.log('Contest update already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting contest update...');

    try {
      const contests = await this.fetchAllContests();
      await this.saveContests(contests);
      console.log(`Successfully updated ${contests.length} contests`);
      
      // Sync contests for subscribed users
      await googleCalendarService.syncContestsForSubscribedUsers();
    } catch (error) {
      console.error('Error updating contests:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async fetchAllContests(): Promise<ContestData[]> {
    const contests: ContestData[] = [];

    try {
      // Fetch from multiple platforms in parallel
      const [codeforcesContests, leetcodeContests, atcoderContests, codechefContests] = await Promise.allSettled([
        this.fetchCodeforcesContests(),
        this.fetchLeetCodeContests(),
        this.fetchAtCoderContests(),
        this.fetchCodeChefContests()
      ]);

      if (codeforcesContests.status === 'fulfilled') {
        contests.push(...codeforcesContests.value);
      }
      if (leetcodeContests.status === 'fulfilled') {
        contests.push(...leetcodeContests.value);
      }
      if (atcoderContests.status === 'fulfilled') {
        contests.push(...atcoderContests.value);
      }
      if (codechefContests.status === 'fulfilled') {
        contests.push(...codechefContests.value);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    }

    return contests;
  }

  private async fetchCodeforcesContests(): Promise<ContestData[]> {
    try {
      const response = await axios.get('https://codeforces.com/api/contest.list');
      const contests = response.data.result || [];

      return contests
        .filter((contest: any) => contest.phase === 'BEFORE' && contest.startTimeSeconds)
        .map((contest: any) => ({
          id: `codeforces_${contest.id}`,
          platform: 'Codeforces',
          name: contest.name,
          startTime: new Date(contest.startTimeSeconds * 1000),
          endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
          url: `https://codeforces.com/contest/${contest.id}`
        }));
    } catch (error) {
      console.error('Error fetching Codeforces contests:', error);
      return [];
    }
  }

  private async fetchLeetCodeContests(): Promise<ContestData[]> {
    // LeetCode's official GraphQL endpoint
    const LEETCODE_API_URL = 'https://leetcode.com/graphql';
  
    // The GraphQL query to fetch upcoming contests
    const GQL_QUERY = `
      query {
        upcomingContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;
  
    try {
      const response = await axios.post(
        LEETCODE_API_URL,
        { query: GQL_QUERY }, // The request body must contain the query
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'contest-calendar-bot', // Good practice to set a user-agent
          },
          timeout: 5000, // 5-second timeout
        },
      );
  
      // The contest data is nested under data.upcomingContests
      const contests = response.data?.data?.upcomingContests || [];
  
      return contests.map((c: any) => {
        // LeetCode API provides timestamps in seconds, but JavaScript's Date needs milliseconds.
        const startTime = new Date(c.startTime * 1000);
        
        // The API provides duration in seconds.
        const endTime = new Date(startTime.getTime() + c.duration * 1000);
  
        return {
          id: `leetcode_${c.titleSlug}`,
          platform: 'LeetCode',
          name: c.title,
          startTime: startTime,
          endTime: endTime,
          url: `https://leetcode.com/contest/${c.titleSlug}`,
        };
      });
    } catch (error) {
      console.error('Failed to fetch LeetCode contests directly:', error);
      return []; // Return an empty array on failure
    }
  }

  private async fetchAtCoderContests(): Promise<ContestData[]> {
    try {
      // Fetch the contests page
      const response = await axios.get('https://atcoder.jp/contests');
      const html = response.data;
  
      // Load into cheerio
      const $ = cheerio.load(html);
  
      const contests: ContestData[] = [];
  
      // Select the "Upcoming Contests" table body
      $('#contest-table-upcoming tbody tr').each((i, el) => {
        const tds = $(el).find('td');
  
        // Ensure the row has the expected number of columns
        if (tds.length < 3) {
          return; // Skip malformed rows
        }
  
        // --- FIX 1: Correctly parse the start time ---
        // Get the time string from the text content of the <time> tag
        const startTimeRaw = $(tds[0]).find('time').text().trim();
        if (!startTimeRaw) {
          return; // Skip if time is not found
        }
  
        // The raw string is like "2025-09-21 21:00:00+0900".
        // We need to replace the space with a 'T' to make it a valid ISO string for Luxon.
        const startTimeISO = startTimeRaw.replace(' ', 'T');
        const startTime = DateTime.fromISO(startTimeISO).toJSDate();
  
        // Get contest name and URL
        const nameAnchor = $(tds[1]).find('a');
        const name = nameAnchor.text().trim();
        const contestUrl = 'https://atcoder.jp' + nameAnchor.attr('href');
  
        // --- FIX 2: Parse duration and calculate the correct end time ---
        const durationText = $(tds[2]).text().trim(); // e.g., "01:40"
        const [hours, minutes] = durationText.split(':').map(Number);
  
        const endTime = DateTime.fromJSDate(startTime)
          .plus({ hours: hours, minutes: minutes })
          .toJSDate();
  
        contests.push({
          id: `atcoder_${nameAnchor.attr('href')?.split('/').pop()}`,
          platform: 'AtCoder',
          name,
          startTime,
          endTime,
          url: contestUrl,
        });
      });
  
      return contests;
    } catch (error) {
      console.error('Error fetching AtCoder contests:', error);
      return [];
    }
  }


  private async fetchCodeChefContests(): Promise<ContestData[]> {
    try {
      const response = await axios.get("https://www.codechef.com/api/list/contests/all");
      const contests = response.data.future_contests || [];
  
      return contests.map((contest: any) => {
        // Use the ISO fields which include timezone offset (+05:30 for IST)
        // e.g., "2025-10-08T20:00:00+05:30" -> automatically converted to UTC by JS Date
        // This eliminates manual IST parsing and ensures correct UTC storage in MongoDB
        const startTime = new Date(contest.contest_start_date_iso);
        const endTime = new Date(contest.contest_end_date_iso);
  
        return {
          id: `codechef_${contest.contest_code}`,
          platform: "CodeChef",
          name: contest.contest_name,
          startTime,
          endTime,
          url: `https://www.codechef.com/${contest.contest_code}`,
        } as ContestData;
      });
    } catch (error) {
      console.error("Error fetching CodeChef contests:", error);
      return [];
    }
  }
  

  private async saveContests(contests: ContestData[]): Promise<void> {
    for (const contestData of contests) {
      try {
        await Contest.findOneAndUpdate(
          { id: contestData.id },
          contestData,
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error saving contest ${contestData.id}:`, error);
      }
    }
  }

  // Manual trigger for testing
  async triggerUpdate(): Promise<void> {
    await this.updateContests();
  }
}

export default new ContestUpdater();
