"use client";

import { motion } from "framer-motion";
import { Calendar, Mail, User, LogOut, Bell, BellOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContestCalendar from "../components/ContestCalendar";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState({
    name: '',
    email: '',
    picture: ''
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [contests, setContests] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderPreference, setReminderPreference] = useState('1h');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Codeforces', 'AtCoder', 'LeetCode', 'CodeChef']);
  const [platformColors, setPlatformColors] = useState<Record<string, string>>({
    Codeforces: '1',
    AtCoder: '4',
    LeetCode: '2',
    CodeChef: '6'
  });
  const GOOGLE_COLORS: Record<string, { name: string; bg: string }> = {
    '1': { name: 'Lavender', bg: 'bg-purple-300' },
    '2': { name: 'Sage', bg: 'bg-emerald-300' },
    '3': { name: 'Grape', bg: 'bg-violet-500' },
    '4': { name: 'Flamingo', bg: 'bg-rose-400' },
    '5': { name: 'Banana', bg: 'bg-yellow-300' },
    '6': { name: 'Tangerine', bg: 'bg-orange-400' },
    '7': { name: 'Peacock', bg: 'bg-cyan-500' },
    '8': { name: 'Graphite', bg: 'bg-gray-600' },
    '9': { name: 'Blueberry', bg: 'bg-blue-600' },
    '10': { name: 'Basil', bg: 'bg-green-600' },
    '11': { name: 'Tomato', bg: 'bg-red-600' },
  };

  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const picture = searchParams.get('picture');

    if (name && email) {
      setUser({ name, email, picture: picture || '' });
    }

    // Check subscription status
    checkSubscriptionStatus();
    // Load contests
    loadContests();
  }, [searchParams]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const subscribed = data.user?.subscribed ?? data.subscribed;
        const pref = data.user?.reminderPreference ?? data.reminderPreference;
        setIsSubscribed(!!subscribed);
        if (pref) setReminderPreference(pref);
        if (Array.isArray(data.user?.platforms)) setSelectedPlatforms(data.user.platforms);
        if (data.user?.platformColors) setPlatformColors(data.user.platformColors);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const loadContests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contests');
      if (response.ok) {
        const data = await response.json();
        setContests(data.contests || []);
      }
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  };

  // Auto-refresh contests every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadContests, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Call logout endpoint and redirect to home
    fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      window.location.href = '/';
    });
  };

  const handleSubscribe = async () => {
    if (isSubscribed) {
      await submitSubscriptionChange(false);
      return;
    }
    setShowReminderModal(true);
  };

  const submitSubscriptionChange = async (subscribe: boolean, pref?: string) => {
    setIsLoading(true);
    setMessage('');
    try {
      const endpoint = subscribe ? '/api/subscribe' : '/api/unsubscribe';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: subscribe ? JSON.stringify({
          reminderPreference: pref || reminderPreference,
          platforms: selectedPlatforms,
          platformColors
        }) : undefined,
      });
      const data = await response.json();
      if (data.success) {
        setIsSubscribed(subscribe);
        if (subscribe && pref) setReminderPreference(pref);
        setMessage(data.message);
        loadContests();
      } else {
        setMessage(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setMessage('An error occurred while updating subscription');
    } finally {
      setIsLoading(false);
      setShowReminderModal(false);
    }
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
              
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-4 ${
                    message.includes('successfully') || message.includes('added')
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {message}
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : isSubscribed
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                }`}
              >
                {isLoading ? 'Processing...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}
              </motion.button>
              {isSubscribed && (
                <div className="mt-4 text-gray-300 text-sm">Reminder: {reminderPreference}</div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Contest Calendar Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-12"
        >
          <ContestCalendar contests={contests} />
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

      {/* Reminder Modal */}
      {showReminderModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReminderModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold text-white mb-4">Subscription preferences</h4>
            <div className="space-y-5 text-gray-200">
              <div>
                <label className="block mb-2 text-sm text-gray-300">Remind me before</label>
                <select
                  value={reminderPreference}
                  onChange={(e) => setReminderPreference(e.target.value)}
                  className="w-full bg-slate-800 text-white border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option className="bg-slate-800" value="10m">10 minutes before</option>
                  <option className="bg-slate-800" value="30m">30 minutes before</option>
                  <option className="bg-slate-800" value="1h">1 hour before</option>
                  <option className="bg-slate-800" value="2h">2 hours before</option>
                </select>
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-300">Select platforms</div>
                {['Codeforces','AtCoder','LeetCode','CodeChef'].map((p) => (
                  <label key={p} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(p)}
                      onChange={(e) => {
                        setSelectedPlatforms((prev) => e.target.checked ? [...prev, p] : prev.filter(x => x !== p));
                      }}
                      className="h-4 w-4 rounded border-white/30 bg-slate-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-white">{p}</span>
                  </label>
                ))}
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-300">Event colors</div>
                {['Codeforces','AtCoder','LeetCode','CodeChef'].map((p) => {
                  const cid = platformColors[p] || '1';
                  const colorMeta = GOOGLE_COLORS[cid] || GOOGLE_COLORS['1'];
                  return (
                    <div key={p} className="flex items-center justify-between mb-2">
                      <span className="text-white mr-3 flex items-center space-x-2">
                        <span className={`inline-block w-3 h-3 rounded ${colorMeta.bg}`}></span>
                        <span>{p}</span>
                      </span>
                      <select
                        value={platformColors[p] || '1'}
                        onChange={(e) => setPlatformColors((prev) => ({ ...prev, [p]: e.target.value }))}
                        className="bg-slate-800 text-white border border-white/20 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {["1","2","3","4","5","6","7","8","9","10","11"].map((id) => (
                          <option key={id} className="bg-slate-800" value={id}>
                            {GOOGLE_COLORS[id]?.name || `Color ${id}`} (id: {id})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitSubscriptionChange(true, reminderPreference)}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
