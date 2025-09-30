"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Contest {
  _id: string;
  id: string;
  platform: string;
  name: string;
  startTime: string;
  endTime: string;
  url: string;
}

interface ContestCalendarProps {
  contests: Contest[];
}

export default function ContestCalendar({ contests }: ContestCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getContestsForDate = (date: Date) => {
    if (!date) return [];
    
    const dateStr = date.toDateString();
    return contests.filter(contest => {
      const contestDate = new Date(contest.startTime);
      return contestDate.toDateString() === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Codeforces': return 'bg-blue-500';
      case 'LeetCode': return 'bg-orange-500';
      case 'AtCoder': return 'bg-gray-900';
      case 'CodeChef': return 'bg-[#5A2D0C]';
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

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </motion.button>
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayContests = date ? getContestsForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              className={`
                min-h-[100px] p-2 border rounded-lg
                ${isCurrentMonth ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700' : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800'}
                ${isToday ? 'ring-2 ring-teal-400' : ''}
                ${dayContests.length > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700' : ''}
                transition-all duration-200
              `}
              onClick={() => dayContests.length > 0 && setSelectedContest(dayContests[0])}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayContests.slice(0, 2).map((contest, contestIndex) => (
                      <motion.div
                        key={contest._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: contestIndex * 0.1 }}
                        className={`
                          text-xs p-1 rounded truncate
                          ${getPlatformColor(contest.platform)} text-white
                          hover:opacity-90 transition-opacity
                        `}
                        title={`${contest.platform}: ${contest.name} at ${formatTime(contest.startTime)}`}
                      >
                        {contest.platform}
                      </motion.div>
                    ))}
                    {dayContests.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayContests.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Contest Details Modal */}
      {selectedContest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedContest(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 max-w-md w-full shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Contest Details</h4>
              <button
                onClick={() => setSelectedContest(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${getPlatformColor(selectedContest.platform)}`}>
                  {selectedContest.platform}
                </span>
              </div>
              
              <div>
                <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {selectedContest.name}
                </h5>
              </div>
              
              <div className="text-gray-700 dark:text-gray-300 space-y-1">
                <p><strong>Start:</strong> {new Date(selectedContest.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(selectedContest.endTime).toLocaleString()}</p>
              </div>
              
              <a
                href={selectedContest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>View Contest</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

