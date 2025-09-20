"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface Contest {
  _id: string;
  id: string;
  platform: string;
  name: string;
  startTime: string;
  endTime: string;
  url: string;
}

interface ContestCardProps {
  contest: Contest;
  index?: number;
}

export default function ContestCard({ contest, index = 0 }: ContestCardProps) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${getPlatformColor(contest.platform)}`}>
            {contest.platform}
          </span>
        </div>
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      
      <h4 className="text-lg font-semibold text-white mb-3 line-clamp-2">
        {contest.name}
      </h4>
      
      <div className="space-y-2 text-gray-300">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Start:</span>
          <span className="text-sm">{formatDate(contest.startTime)} at {formatTime(contest.startTime)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">End:</span>
          <span className="text-sm">{formatDate(contest.endTime)} at {formatTime(contest.endTime)}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <span>View Contest</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
