"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSubscription } from "./useSubscription";

interface UnsubscribeButtonProps {
  onUnsubscribeSuccess?: () => void;
  onLoadContests?: () => void;
}

export default function UnsubscribeButton({ onUnsubscribeSuccess, onLoadContests }: UnsubscribeButtonProps) {
  const { isLoading, submitSubscriptionChange } = useSubscription();
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);

  const handleSubmitUnsubscribe = async (removeExisting: boolean) => {
    await submitSubscriptionChange(false, undefined, removeExisting);
    setShowUnsubscribeModal(false);
    onLoadContests?.();
    onUnsubscribeSuccess?.();
  };

  return (
    <>
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
            className="max-w-md w-full rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
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
                onClick={async () => handleSubmitUnsubscribe(true)}
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
                onClick={async () => handleSubmitUnsubscribe(false)}
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
    </>
  );
}
