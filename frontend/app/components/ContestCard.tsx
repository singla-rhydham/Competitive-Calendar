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
      case "Codeforces":
        return "bg-teal-600";
      case "LeetCode":
        return "bg-emerald-600";
      case "AtCoder":
        return "bg-slate-700";
      case "CodeChef":
        return "bg-amber-700";
      default:
        return "bg-teal-600";
    }
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className=" mt-4
        rounded-2xl p-5
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        shadow-sm hover:shadow-md transition-shadow
      "
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-sm font-semibold text-white
              ${getPlatformColor(contest.platform)}
            `}
          >
            {contest.platform}
          </span>
        </div>
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2">
        {contest.name}
      </h4>

      <div className="space-y-2">
        <div
          className="
            flex items-center justify-between text-sm
            bg-slate-50 dark:bg-slate-700/50
            text-slate-700 dark:text-slate-200
            rounded-xl px-3 py-2
          "
        >
          <span className="font-medium">Start</span>
          <span>{formatDate(contest.startTime)} • {formatTime(contest.startTime)}</span>
        </div>
        <div
          className="
            flex items-center justify-between text-sm
            bg-slate-50 dark:bg-slate-700/50
            text-slate-700 dark:text-slate-200
            rounded-xl px-3 py-2
          "
        >
          <span className="font-medium">End</span>
          <span>{formatDate(contest.endTime)} • {formatTime(contest.endTime)}</span>
        </div>
      </div>

      <div className="mt-4">
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2
            bg-teal-600 hover:bg-teal-700 text-white
            px-4 py-2 rounded-xl text-sm font-medium
            transition-colors
          "
        >
          <span>View Contest</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
