"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const Contest_js_1 = __importDefault(require("../models/Contest.js"));
const node_cron_1 = __importDefault(require("node-cron"));
const googleCalendar_js_1 = __importDefault(require("./googleCalendar.js"));
class ContestUpdater {
    constructor() {
        this.isRunning = false;
        // Run every 6 hours
        node_cron_1.default.schedule('0 */6 * * *', () => {
            console.log('Running scheduled contest update...');
            this.updateContests();
        });
    }
    async updateContests() {
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
            await googleCalendar_js_1.default.syncContestsForSubscribedUsers();
        }
        catch (error) {
            console.error('Error updating contests:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    async fetchAllContests() {
        const contests = [];
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
        }
        catch (error) {
            console.error('Error fetching contests:', error);
        }
        return contests;
    }
    async fetchCodeforcesContests() {
        try {
            const response = await axios_1.default.get('https://codeforces.com/api/contest.list');
            const contests = response.data.result || [];
            return contests
                .filter((contest) => contest.phase === 'BEFORE' && contest.startTimeSeconds)
                .map((contest) => ({
                    id: `codeforces_${contest.id}`,
                    platform: 'Codeforces',
                    name: contest.name,
                    startTime: new Date(contest.startTimeSeconds * 1000),
                    endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
                    url: `https://codeforces.com/contest/${contest.id}`
                }));
        }
        catch (error) {
            console.error('Error fetching Codeforces contests:', error);
            return [];
        }
    }
    async fetchLeetCodeContests() {
        try {
            const { data: html } = await axios.get('https://leetcode.com/contest/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const $ = cheerio.load(html);
            const contests = [];

            // Find the __NEXT_DATA__ script which contains all contests
            const scriptContent = $('#__NEXT_DATA__').html();
            if (scriptContent) {
                const json = JSON.parse(scriptContent);
                const upcoming =
                    json?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data
                        ?.contestUpcomingContests || [];

                for (const c of upcoming) {
                    contests.push({
                        id: `leetcode_${c.titleSlug}`,
                        platform: 'LeetCode',
                        name: c.title,
                        startTime: new Date(c.startTime * 1000),
                        endTime: new Date((c.startTime + c.duration) * 1000),
                        url: `https://leetcode.com/contest/${c.titleSlug}`
                    });
                }
            }

            console.log(`Found ${contests.length} LeetCode contests`);
            return contests;
        } catch (error) {
            console.error('Error fetching LeetCode contests:', error);
            return [];
        }
    }
    async getLeetCodeContestInfo(slug) {
        try {
            const response = await axios_1.default.get(`https://leetcode.com/contest/api/info/${slug}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return response.data.contest;
        }
        catch (error) {
            console.log(`Could not fetch LeetCode contest info for ${slug}:`, error.message);
            return null;
        }
    }
    async fetchAtCoderContests() {
        try {
            const { data: html } = await axios.get('https://atcoder.jp/contests', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(html);
            const contests = [];

            // Upcoming contests table always after <h2>Upcoming Contests</h2>
            const upcomingTable = $('h2:contains("Upcoming Contests")').next('table');

            upcomingTable.find('tbody tr').each((i, el) => {
                const time = $(el).find('td').eq(0).find('time').attr('datetime');
                const linkEl = $(el).find('td').eq(1).find('a');
                const name = linkEl.text().trim();
                const href = linkEl.attr('href');

                if (time && name && href) {
                    const startTime = new Date(time);
                    if (startTime > new Date()) {
                        const contestId = href.split('/').pop();
                        const duration = this.getAtCoderContestDuration(contestId);
                        contests.push({
                            id: `atcoder_${contestId}`,
                            platform: 'AtCoder',
                            name,
                            startTime,
                            endTime: new Date(startTime.getTime() + duration * 60 * 1000),
                            url: href.startsWith('http') ? href : `https://atcoder.jp${href}`
                        });
                    }
                }
            });

            console.log(`Found ${contests.length} AtCoder contests`);
            return contests;
        } catch (error) {
            console.error('Error fetching AtCoder contests:', error);
            return [];
        }
    }

    getAtCoderContestDuration(contestId) {
        // Default durations for different contest types
        const durationMap = {
            'abc': 100, // ABC contests are usually 100 minutes
            'arc': 120, // ARC contests are usually 120 minutes
            'agc': 150, // AGC contests are usually 150 minutes
            'ahc': 120, // AHC contests are usually 120 minutes
        };
        const contestType = contestId.toLowerCase().split('-')[0];
        return durationMap[contestType] || 120; // Default to 120 minutes
    }
    async fetchCodeChefContests() {
        try {
            const response = await axios_1.default.get('https://www.codechef.com/api/list/contests/all');
            const contests = response.data.future_contests || [];
            return contests.map((contest) => ({
                id: `codechef_${contest.contest_code}`,
                platform: 'CodeChef',
                name: contest.contest_name,
                startTime: new Date(contest.contest_start_date),
                endTime: new Date(contest.contest_end_date),
                url: `https://www.codechef.com/${contest.contest_code}`
            }));
        }
        catch (error) {
            console.error('Error fetching CodeChef contests:', error);
            return [];
        }
    }
    async saveContests(contests) {
        for (const contestData of contests) {
            try {
                await Contest_js_1.default.findOneAndUpdate({ id: contestData.id }, contestData, { upsert: true, new: true });
            }
            catch (error) {
                console.error(`Error saving contest ${contestData.id}:`, error);
            }
        }
    }
    // Manual trigger for testing
    async triggerUpdate() {
        await this.updateContests();
    }
}
exports.default = new ContestUpdater();
