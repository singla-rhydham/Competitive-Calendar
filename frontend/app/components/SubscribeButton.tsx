"use client";

import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { useSubscription } from "./useSubscription";

interface SubscribeButtonProps {
  onSubscribeSuccess?: () => void;
  onLoadContests?: () => void;
  initialSubscribed?: boolean;
}

export default function SubscribeButton({ onSubscribeSuccess, onLoadContests, initialSubscribed }: SubscribeButtonProps) {
  const {
    isSubscribed,
    isLoading,
    message,
    reminderPreference,
    selectedPlatforms,
    platformColors,
    toast,
    submitSubscriptionChange,
    setToast,
    setReminderPreference,
    setSelectedPlatforms,
    setPlatformColors,
  } = useSubscription(initialSubscribed);

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);

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

  const handleSubscribe = async () => {
    if (isSubscribed) {
      setShowUnsubscribeModal(true);
      return;
    }
    setShowReminderModal(true);
  };

  const handleSubmitSubscription = async (subscribe: boolean, pref?: string, removeExisting?: boolean) => {
    await submitSubscriptionChange(subscribe, pref, removeExisting);
    if (subscribe && onLoadContests) {
      onLoadContests();
    }
    if (subscribe) {
      setShowReminderModal(false);
      if (onSubscribeSuccess) {
        onSubscribeSuccess();
      }
    }
  };

  return (
    <>
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

      {/* Reminder Modal */}
      {showReminderModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { if (!isLoading) setShowReminderModal(false); }}
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
                        setSelectedPlatforms((prev: string[]) => e.target.checked ? [...prev, p] : prev.filter((x: string) => x !== p));
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
                        onChange={(e) => setPlatformColors((prev: Record<string, string>) => ({ ...prev, [p]: e.target.value }))}
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
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg ${isLoading ? 'bg-white/5 text-white/50 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitSubscription(true, reminderPreference)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${isLoading ? 'bg-blue-500/60 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUnsubscribeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold text-white mb-2">Unsubscribe options</h4>
            <p className="text-gray-300 mb-4">Choose what to do with your existing contest events.</p>
            <div className="space-y-3">
              <button
                disabled={isLoading}
                onClick={async () => {
                  setShowUnsubscribeModal(false);
                  await handleSubmitSubscription(false, undefined, true);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/15'
                } border-white/20 bg-red-500/10 text-red-200`}
              >
                Remove all my contest events from Google Calendar
              </button>
              <button
                disabled={isLoading}
                onClick={async () => {
                  setShowUnsubscribeModal(false);
                  await handleSubmitSubscription(false, undefined, false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/15'
                } border-white/20 bg-yellow-500/10 text-yellow-200`}
              >
                Keep existing events but stop adding new ones
              </button>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowUnsubscribeModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  Cancel (I don't want to unsubscribe)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'error' ? 'bg-red-500/20 text-red-100 border-red-500/30' : 'bg-green-500/20 text-green-100 border-green-500/30'}`}
             onAnimationEnd={() => setTimeout(() => setToast(null), 4000)}>
          {toast.message}
        </div>
      )}
    </>
  );
}
