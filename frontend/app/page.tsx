"use client";

import { motion } from "framer-motion";
import { Calendar, Code, Clock, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
          className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl"
        >
          <Calendar className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Contest Calendar
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-300 font-light"
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
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
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
                  className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
                >
                  <Code className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                >
                  <Clock className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Stay Ahead of Every Contest
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              This tool integrates upcoming programming contests directly into your Google Calendar 
              with custom reminders, so you can focus on solving problems, not tracking dates.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Login Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="max-w-md mx-auto px-6 mb-16"
      >
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Login with Google</span>
          </motion.button>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-sm text-gray-400 mt-4"
          >
            Grant access to sync contests into your Google Calendar
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
        <div className="flex items-center justify-center space-x-2 text-gray-400">
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
