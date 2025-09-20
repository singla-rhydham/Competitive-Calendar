"use client";

import { motion } from "framer-motion";
import { Calendar, ExternalLink } from "lucide-react";

interface Contest {
  _id: string;
  id: string;
  platform: string;
  name: string;
  startTime: string;
  endTime: string;
  url: string;
}

interface CalendarPreviewProps {
  contests: Contest[];
}

export default function CalendarPreview({ contests }: CalendarPreviewProps) {
  // Get upcoming contests (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingContests = contests.filter(contest => {
    const contestDate = new Date(contest.startTime);
    return contestDate >= now && contestDate <= nextWeek;
  }).slice(0, 5); // Show only next 5 contests

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Codeforces': return 'bg-red-500';
      case 'LeetCode': return 'bg-orange-500';
      case 'AtCoder': return 'bg-yellow-500';
      case 'CodeChef': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          Calendar Preview
        </h3>
      </div>
      
      {upcomingContests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">
            No upcoming contests in the next 7 days
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingContests.map((contest, index) => (
            <motion.div
              key={contest._id || contest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${getPlatformColor(contest.platform)}`}></span>
                  <span className="text-xs font-medium text-gray-300">{contest.platform}</span>
                </div>
                <a
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">
                {contest.name}
              </h4>
              
              <div className="text-xs text-gray-400">
                <div>{formatDate(contest.startTime)}</div>
                <div>{formatTime(contest.startTime)}</div>
              </div>
            </motion.div>
          ))}
          
          {contests.length > 5 && (
            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400">
                And {contests.length - 5} more contests...
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
