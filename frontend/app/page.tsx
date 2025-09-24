"use client";

import { motion } from "framer-motion";
import { Calendar, Code, Clock, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import GoogleLoginButton from "./components/GoogleLoginButton";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  subscribed: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      setUser(null);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-16 pb-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-teal-600 rounded-full shadow"
        >
          <Calendar className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Contest Calendar
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light"
        >
          Never miss a coding contest again.
        </motion.p>
      </motion.header>

      {/* Description Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="max-w-4xl mx-auto px-6 mb-16"
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-slate-700 shadow">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-3 bg-teal-600 rounded-xl"
                >
                  <Code className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="p-3 bg-slate-600 rounded-xl"
                >
                  <Clock className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              Stay Ahead of Every Contest
            </h2>
            
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              This tool integrates upcoming programming contests directly into your Google Calendar 
              with custom reminders, so you can focus on solving problems, not tracking dates.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Login/Action Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="max-w-md mx-auto px-6 mb-16"
      >
        <div className="text-center">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center space-x-4 mb-4">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-slate-700"
                    />
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{user.email}</p>
                  </div>
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.subscribed 
                    ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {user.subscribed ? 'Subscribed to notifications' : 'Not subscribed'}
                </div>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Go to Dashboard
                </motion.button>
                <GoogleLoginButton user={user} onLogout={handleLogout} />
              </div>
            </div>
          ) : (
            <GoogleLoginButton />
          )}
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-sm text-gray-600 dark:text-gray-400 mt-4"
          >
            {user ? 'Manage your contest notifications' : 'Grant access to sync contests into your Google Calendar'}
          </motion.p>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="text-center pb-8"
      >
        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
          <span>Built with</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </motion.div>
          <span>by Rhydham</span>
        </div>
      </motion.footer>
    </div>
  );
}
