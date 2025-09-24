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

export default function SubscribeButton({
  onSubscribeSuccess,
  onLoadContests,
  initialSubscribed,
}: SubscribeButtonProps) {
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
    "1": { name: "Lavender", bg: "bg-purple-300" },
    "2": { name: "Sage", bg: "bg-emerald-300" },
    "3": { name: "Grape", bg: "bg-violet-500" },
    "4": { name: "Flamingo", bg: "bg-rose-400" },
    "5": { name: "Banana", bg: "bg-yellow-300" },
    "6": { name: "Tangerine", bg: "bg-orange-400" },
    "7": { name: "Peacock", bg: "bg-cyan-500" },
    "8": { name: "Graphite", bg: "bg-gray-600" },
    "9": { name: "Blueberry", bg: "bg-blue-600" },
    "10": { name: "Basil", bg: "bg-green-600" },
    "11": { name: "Tomato", bg: "bg-red-600" },
  };

  const handleSubscribe = async () => {
    if (isSubscribed) {
      setShowUnsubscribeModal(true);
      return;
    }
    setShowReminderModal(true);
  };

  const handleSubmitSubscription = async (
    subscribe: boolean,
    pref?: string,
    removeExisting?: boolean
  ) => {
    await submitSubscriptionChange(subscribe, pref, removeExisting);
    if (subscribe && onLoadContests) onLoadContests();
    if (subscribe) {
      setShowReminderModal(false);
      onSubscribeSuccess?.();
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
        <div
          className="
            rounded-3xl p-8
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            shadow-sm
          "
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {isSubscribed ? (
                  <Bell className="w-8 h-8 text-teal-600 dark:text-white" />
                ) : (
                  <BellOff className="w-8 h-8 text-teal-600 dark:text-white" />
                )}
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                {isSubscribed
                  ? "Subscribed to Notifications"
                  : "Subscribe to Contest Notifications"}
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                {isSubscribed
                  ? "You'll receive notifications about upcoming coding contests"
                  : "Get notified about upcoming coding contests and never miss an opportunity"}
              </p>
            </motion.div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-4 border ${
                  /success|added|Successfully/i.test(message)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {message}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              onClick={handleSubscribe}
              disabled={isLoading}
              className={`
                px-8 py-4 rounded-2xl font-semibold text-lg transition-colors
                ${
                  isLoading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : isSubscribed
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white dark:border-slate-600"
                    : "bg-teal-600 hover:bg-teal-700 text-white"
                }
              `}
            >
              {isLoading ? "Processing..." : isSubscribed ? "Unsubscribe" : "Subscribe"}
            </motion.button>

            {isSubscribed && (
              <div className="mt-4 text-slate-700 dark:text-slate-300 text-sm">
                Reminder: {reminderPreference}
              </div>
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
          onClick={() => !isLoading && setShowReminderModal(false)}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="
              max-w-md w-full
              rounded-2xl p-6
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              shadow-sm
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Subscription preferences
            </h4>

            <div className="space-y-5 text-slate-700 dark:text-slate-300">
              <div>
                <label className="block mb-2 text-sm">Remind me before</label>
                <select
                  value={reminderPreference}
                  onChange={(e) => setReminderPreference(e.target.value)}
                  className="
                    w-full p-3 rounded-lg
                    bg-white dark:bg-slate-800
                    text-slate-900 dark:text-white
                    border border-slate-300 dark:border-slate-700
                    outline-none focus:ring-2 focus:ring-teal-500
                  "
                >
                  <option value="10m">10 minutes before</option>
                  <option value="30m">30 minutes before</option>
                  <option value="1h">1 hour before</option>
                  <option value="2h">2 hours before</option>
                </select>
              </div>

              <div>
                <div className="mb-2 text-sm">Select platforms</div>
                {["Codeforces", "AtCoder", "LeetCode", "CodeChef"].map((p) => (
                  <label key={p} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(p)}
                      onChange={(e) =>
                        setSelectedPlatforms((prev: string[]) =>
                          e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)
                        )
                      }
                      className="
                        h-4 w-4 rounded
                        border-slate-300 dark:border-slate-600
                        bg-white dark:bg-slate-800
                        text-teal-600 focus:ring-teal-500
                      "
                    />
                    <span className="text-slate-900 dark:text-white">{p}</span>
                  </label>
                ))}
              </div>

              <div>
                <div className="mb-2 text-sm">Event colors</div>
                {["Codeforces", "AtCoder", "LeetCode", "CodeChef"].map((p) => {
                  const cid = platformColors[p] || "1";
                  const meta = GOOGLE_COLORS[cid] || GOOGLE_COLORS["1"];
                  return (
                    <div key={p} className="flex items-center justify-between mb-2">
                      <span className="text-slate-900 dark:text-white mr-3 flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded ${meta.bg}`} />
                        <span>{p}</span>
                      </span>
                      <select
                        value={platformColors[p] || "1"}
                        onChange={(e) =>
                          setPlatformColors((prev: Record<string, string>) => ({
                            ...prev,
                            [p]: e.target.value,
                          }))
                        }
                        className="
                          p-2 rounded-lg
                          bg-white dark:bg-slate-800
                          text-slate-900 dark:text-white
                          border border-slate-300 dark:border-slate-700
                          outline-none focus:ring-2 focus:ring-teal-500
                        "
                      >
                        {Object.keys(GOOGLE_COLORS).map((id) => (
                          <option key={id} value={id}>
                            {GOOGLE_COLORS[id].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowReminderModal(false)}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 rounded-lg
                    ${isLoading ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white dark:border-slate-600"}
                  `}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitSubscription(true, reminderPreference)}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 rounded-lg flex items-center justify-center gap-2
                    ${isLoading ? "bg-teal-600/70 cursor-wait" : "bg-teal-600 hover:bg-teal-700"}
                    text-white
                  `}
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
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="
              max-w-md w-full
              rounded-2xl p-6
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              shadow-sm
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Unsubscribe options
            </h4>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Choose what to do with your existing contest events.
            </p>
            <div className="space-y-3">
              <button
                disabled={isLoading}
                onClick={async () => {
                  setShowUnsubscribeModal(false);
                  await handleSubmitSubscription(false, undefined, true);
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-xl border transition-colors
                  ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-rose-50 dark:hover:bg-rose-900/20"}
                  border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-900/10
                  text-rose-700 dark:text-rose-200
                `}
              >
                Remove all my contest events from Google Calendar
              </button>
              <button
                disabled={isLoading}
                onClick={async () => {
                  setShowUnsubscribeModal(false);
                  await handleSubmitSubscription(false, undefined, false);
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-xl border transition-colors
                  ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-amber-50 dark:hover:bg-amber-900/20"}
                  border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10
                  text-amber-700 dark:text-amber-200
                `}
              >
                Keep existing events but stop adding new ones
              </button>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowUnsubscribeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white dark:border-slate-600"
                >
                  Cancel (I don't want to unsubscribe)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border
            ${
              toast.type === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }
          `}
          onAnimationEnd={() => setTimeout(() => setToast(null), 4000)}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
