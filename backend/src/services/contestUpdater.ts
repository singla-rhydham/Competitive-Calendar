import axios from 'axios';
import * as cheerio from 'cheerio';
import Contest from '../models/Contest.js';
import cron from 'node-cron';
import googleCalendarService from './googleCalendar.js';

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
    // Run every 6 hours
    cron.schedule('0 */6 * * *', () => {
      console.log('Running scheduled contest update...');
      this.updateContests();
    });
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
    // Try primary (kontests.net) with retry+timeout, then fallback to clist.by with retry+timeout
    const maxAttempts = 2;
    const timeoutMs = 5000;

    const tryKontests = async (): Promise<ContestData[]> => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await axios.get('https://kontests.net/api/v1/leetcode', {
            headers: { 'User-Agent': 'contest-calendar-bot' },
            timeout: timeoutMs,
          });
          const data = Array.isArray(response.data) ? response.data : [];
          return data
            .filter((c: any) => c && c.start_time && c.end_time && c.name)
            .map((c: any) => ({
              id: `leetcode_${c.name.replace(/\s+/g, '_').toLowerCase()}`,
              platform: 'LeetCode',
              name: c.name,
              startTime: new Date(c.start_time),
              endTime: new Date(c.end_time),
              url: c.url || `https://leetcode.com/contest/`
            }));
        } catch (error) {
          console.error(`kontests.net fetch attempt ${attempt} failed:`, error);
          if (attempt === maxAttempts) throw error;
        }
      }
      return [];
    };

    const tryClist = async (): Promise<ContestData[]> => {
      const username = process.env.CLIST_USERNAME;
      const apiKey = process.env.CLIST_API_KEY;
      if (!username || !apiKey) {
        console.warn('CLIST credentials missing; skipping fallback.');
        return [];
      }
      const params = new URLSearchParams({ resource: 'leetcode.com', upcoming: 'true', order_by: 'start' });
      const url = `https://clist.by/api/v2/contest/?${params.toString()}`;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await axios.get(url, {
            timeout: timeoutMs,
            auth: { username, password: apiKey },
          });
          const objects = Array.isArray(response.data?.objects) ? response.data.objects : [];
          return objects.map((o: any) => ({
            id: `leetcode_${String(o.id)}`,
            platform: 'LeetCode',
            name: o.event || o.title || 'LeetCode Contest',
            startTime: new Date(o.start),
            endTime: new Date(o.end),
            url: o.href || 'https://leetcode.com/contest/'
          }));
        } catch (error) {
          console.error(`clist.by fetch attempt ${attempt} failed:`, error);
          if (attempt === maxAttempts) throw error;
        }
      }
      return [];
    };

    try {
      return await tryKontests();
    } catch (primaryError) {
      console.warn('Primary source failed; falling back to clist.by...');
      try {
        return await tryClist();
      } catch (fallbackError) {
        console.error('Failed to fetch LeetCode contests from all sources.');
        return [];
      }
    }
  }

  private async getLeetCodeContestInfo(slug: string): Promise<any> {
    try {
      const response = await axios.get(`https://leetcode.com/contest/api/info/${slug}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return response.data.contest;
    } catch (error) {
      console.log(`Could not fetch LeetCode contest info for ${slug}:`, error);
      return null;
    }
  }
  

  private async fetchAtCoderContests(): Promise<ContestData[]> {
    try {
      // Fetch the contests page
      const response = await axios.get('https://atcoder.jp/contests');
      const html = response.data;
  
      // Load into cheerio
      const $ = cheerio.load(html);
  
      // AtCoder has tables for upcoming contests, typically inside the 1st table of "Future Contests"
      const contests: ContestData[] = [];
  
      // Select the "Upcoming Contests" section
      $('#contest-table-upcoming tbody tr').each((i, el) => {
        const tds = $(el).find('td');
  
        const dateText = $(tds[0]).text().trim();
        const nameAnchor = $(tds[1]).find('a');
        const contestUrl = 'https://atcoder.jp' + nameAnchor.attr('href');
  
        const name = nameAnchor.text().trim();
  
        // parse date/time (AtCoder shows JST times)
        // Example format: 2025-09-21 21:00:00+0900
        const startTimeStr = $(tds[0]).find('time').attr('datetime');
        const startTime = startTimeStr ? new Date(startTimeStr) : new Date();
  
        // You can’t get end time easily; assume +2 hours or leave blank.
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  
        contests.push({
          id: `atcoder_${nameAnchor.attr('href')?.split('/').pop()}`,
          platform: 'AtCoder',
          name,
          startTime,
          endTime,
          url: contestUrl
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
      const response = await axios.get('https://www.codechef.com/api/list/contests/all');
      const contests = response.data.future_contests || [];

      return contests.map((contest: any) => ({
        id: `codechef_${contest.contest_code}`,
        platform: 'CodeChef',
        name: contest.contest_name,
        startTime: new Date(contest.contest_start_date),
        endTime: new Date(contest.contest_end_date),
        url: `https://www.codechef.com/${contest.contest_code}`
      }));
    } catch (error) {
      console.error('Error fetching CodeChef contests:', error);
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
