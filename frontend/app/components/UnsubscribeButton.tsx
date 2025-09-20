"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSubscription } from "./useSubscription";

interface UnsubscribeButtonProps {
  onUnsubscribeSuccess?: () => void;
  onLoadContests?: () => void;
}

export default function UnsubscribeButton({ onUnsubscribeSuccess, onLoadContests }: UnsubscribeButtonProps) {
  const {
    isLoading,
    submitSubscriptionChange,
  } = useSubscription();

  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);

  const handleUnsubscribe = () => {
    setShowUnsubscribeModal(true);
  };

  const handleSubmitUnsubscribe = async (removeExisting: boolean) => {
    await submitSubscriptionChange(false, undefined, removeExisting);
    setShowUnsubscribeModal(false);
    if (onLoadContests) {
      onLoadContests();
    }
    if (onUnsubscribeSuccess) {
      onUnsubscribeSuccess();
    }
  };

  return (
    <>
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
                  await handleSubmitUnsubscribe(true);
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
                  await handleSubmitUnsubscribe(false);
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
    </>
  );
}
