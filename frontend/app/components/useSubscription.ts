"use client";

import { useState, useEffect } from 'react';
import type { Dispatch } from 'react';

interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  message: string;
  reminderPreference: string;
  selectedPlatforms: string[];
  platformColors: Record<string, string>;
  toast: { type: 'error' | 'success'; message: string } | null;
}

interface UseSubscriptionReturn extends SubscriptionState {
  checkSubscriptionStatus: () => Promise<void>;
  submitSubscriptionChange: (subscribe: boolean, pref?: string, removeExisting?: boolean) => Promise<void>;
  setToast: (toast: { type: 'error' | 'success'; message: string } | null) => void;
  setReminderPreference: (pref: string) => void;
  setSelectedPlatforms: Dispatch<React.SetStateAction<string[]>>;
  setPlatformColors: Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function useSubscription(initialSubscribed?: boolean): UseSubscriptionReturn {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed || false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reminderPreference, setReminderPreference] = useState('1h');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Codeforces', 'AtCoder', 'LeetCode', 'CodeChef']);
  const [platformColors, setPlatformColors] = useState<Record<string, string>>({
    Codeforces: '1',
    AtCoder: '4',
    LeetCode: '2',
    CodeChef: '6'
  });
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const checkSubscriptionStatus = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/status`, {
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

  // Initialize subscription state from backend on first mount
  useEffect(() => {
    // Call without adding as dependency to avoid re-runs; inline wrapper prevents lint warning
    (async () => {
      await checkSubscriptionStatus();
    })();
  }, []);

  const submitSubscriptionChange = async (subscribe: boolean, pref?: string, removeExisting?: boolean) => {
    setIsLoading(true);
    setMessage('');
    try {
      const endpoint = subscribe ? '/api/subscribe' : '/api/unsubscribe';
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: subscribe ? JSON.stringify({
          reminderPreference: pref || reminderPreference,
          platforms: selectedPlatforms,
          platformColors,
          timeZone: userTimeZone
        }) : JSON.stringify({ removeExisting: !!removeExisting }),
      });
      const data = await response.json();
      if (data.success) {
        setIsSubscribed(subscribe);
        if (subscribe && pref) setReminderPreference(pref);
        setMessage(data.message);
        if (subscribe) {
          // Close modal logic can be handled by parent components
        }
      } else {
        setMessage(data.message || 'An error occurred');
        setToast({ type: 'error', message: data.message || 'Failed to update subscription. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setMessage('An error occurred while updating subscription');
      setToast({ type: 'error', message: 'Network error while updating subscription. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSubscribed,
    isLoading,
    message,
    reminderPreference,
    selectedPlatforms,
    platformColors,
    toast,
    checkSubscriptionStatus,
    submitSubscriptionChange,
    setToast,
    setReminderPreference,
    setSelectedPlatforms,
    setPlatformColors,
  };
}
