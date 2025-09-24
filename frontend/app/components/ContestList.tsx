"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import ContestCard from "./ContestCard";

interface Contest {
  _id: string;
  id: string;
  platform: string;
  name: string;
  startTime: string;
  endTime: string;
  url: string;
}

interface ContestListProps {
  contests: Contest[];
}

export default function ContestList({ contests }: ContestListProps) {
  const sortedContests = [...contests].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const contestsByDate = sortedContests.reduce((acc, contest) => {
    const date = new Date(contest.startTime).toDateString();
    (acc[date] ||= []).push(contest);
    return acc;
  }, {} as Record<string, Contest[]>);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (sortedContests.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mb-12"
      >
        <div
          className="
            rounded-3xl p-8
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            shadow-sm
          "
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-teal-600 dark:text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              No Contests Available
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              There are no upcoming contests at the moment. Check back later for new contests!
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
      className="mb-12"
    >
      <div
        className="
          rounded-3xl p-8
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          shadow-sm
        "
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Upcoming Contests
          </h3>
        </div>

        <div className="space-y-8">
          {Object.entries(contestsByDate).map(([date, dateContests], idx) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <h4
                className="
                  text-lg font-semibold
                  text-slate-900 dark:text-white
                  border-b border-slate-200 dark:border-slate-700
                  pb-2
                "
              >
                {formatDateHeader(date)}
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dateContests.map((contest, contestIndex) => (
                  <ContestCard
                    key={contest._id || contest.id}
                    contest={contest}
                    index={contestIndex}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
