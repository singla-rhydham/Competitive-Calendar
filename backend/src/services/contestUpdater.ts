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
    try {
      // Fetch the HTML of the contest page
      const { data: html } = await axios.get('https://leetcode.com/contest/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(html);
  
      const contests: ContestData[] = [];
  
      // Look for upcoming contests in the HTML
      // LeetCode contest cards are typically in divs with specific classes
      $('div[class*="contest-card"], div[class*="contest-item"]').each((i, el) => {
        const $el = $(el);
        const name = $el.find('div[class*="title"], div[class*="name"], h3, h4').first().text().trim();
        const link = $el.find('a').first().attr('href') || '';
        const timeText = $el.find('div[class*="time"], div[class*="date"]').text().trim();
  
        if (name && link && !name.toLowerCase().includes('past')) {
          const slug = link.replace('/contest/', '').replace('/', '');
          const contestUrl = link.startsWith('http') ? link : `https://leetcode.com${link}`;
  
          // Try to get exact contest info from API
          this.getLeetCodeContestInfo(slug).then(contestInfo => {
            if (contestInfo) {
              contests.push({
                id: `leetcode_${slug}`,
                platform: 'LeetCode',
                name: contestInfo.title || name,
                startTime: new Date(contestInfo.start_time * 1000),
                endTime: new Date((contestInfo.start_time + contestInfo.duration) * 1000),
                url: contestUrl,
              });
            }
          }).catch(() => {
            // Fallback to basic info if API fails
            contests.push({
              id: `leetcode_${slug}`,
              platform: 'LeetCode',
              name,
              startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
              endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Default to tomorrow + 1 hour
              url: contestUrl,
            });
          });
        }
      });

      // Also try to find contests in script tags (JSON data)
      $('script').each((i, script) => {
        const scriptContent = $(script).html();
        if (scriptContent && scriptContent.includes('upcomingContests')) {
          try {
            const jsonMatch = scriptContent.match(/upcomingContests[^=]*=\s*(\[.*?\]);/s);
            if (jsonMatch) {
              const contestsData = JSON.parse(jsonMatch[1]);
              contestsData.forEach((contest: any) => {
                if (contest.startTime && contest.duration) {
                  contests.push({
                    id: `leetcode_${contest.titleSlug || contest.slug}`,
                    platform: 'LeetCode',
                    name: contest.title || contest.name,
                    startTime: new Date(contest.startTime * 1000),
                    endTime: new Date((contest.startTime + contest.duration) * 1000),
                    url: `https://leetcode.com/contest/${contest.titleSlug || contest.slug}`,
                  });
                }
              });
            }
          } catch (e) {
            console.log('Could not parse LeetCode JSON data:', e);
          }
        }
      });
  
      return contests;
    } catch (error) {
      console.error('Error fetching LeetCode contests:', error);
      return [];
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
