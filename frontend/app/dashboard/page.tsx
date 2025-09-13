"use client";

import { motion } from "framer-motion";
import { Calendar, Mail, User, LogOut, Bell, BellOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState({
    name: '',
    email: '',
    picture: ''
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const picture = searchParams.get('picture');

    if (name && email) {
      setUser({ name, email, picture: picture || '' });
    }
  }, [searchParams]);

  const handleLogout = () => {
    // Call logout endpoint and redirect to home
    fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      window.location.href = '/';
    });
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    // Here you would typically call your backend API to update subscription status
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-8 pb-6 px-6"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Contest Calendar</h1>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-6">
              {user.picture && (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  src={user.picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-white/20"
                />
              )}
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  Hi, {user.name} 👋
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="flex items-center space-x-2 text-gray-300"
                >
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Subscription Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-6"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isSubscribed ? (
                    <Bell className="w-8 h-8 text-white" />
                  ) : (
                    <BellOff className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {isSubscribed ? 'Subscribed to Notifications' : 'Subscribe to Contest Notifications'}
                </h3>
                <p className="text-gray-300">
                  {isSubscribed 
                    ? 'You\'ll receive notifications about upcoming coding contests'
                    : 'Get notified about upcoming coding contests and never miss an opportunity'
                  }
                </p>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  isSubscribed
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                }`}
              >
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              What's Next?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Contest Calendar
                </h4>
                <p className="text-gray-300">
                  View all upcoming coding contests from major platforms like Codeforces, LeetCode, and more.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Smart Notifications
                </h4>
                <p className="text-gray-300">
                  Get personalized reminders based on your preferences and contest history.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="text-center pb-8 mt-16"
      >
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <span>Welcome to your Contest Calendar</span>
        </div>
      </motion.footer>
    </div>
  );
}
