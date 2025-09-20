"use client";

import { motion } from "framer-motion";
import { Calendar, Mail, Bell } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContestCalendar from "../components/ContestCalendar";
import SubscribeButton from "../components/SubscribeButton";
import ContestList from "../components/ContestList";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<null | {
    name: string;
    email: string;
    picture: string;
    subscribed: boolean;
  }>(null);

  const [contests, setContests] = useState([]);

  useEffect(() => {
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const picture = searchParams.get("picture");

    if (name && email) {
      // Fresh login - set user from query params first
      setUser({
        name,
        email,
        picture: picture || "",
        subscribed: false, // temporary until backend confirms
      });
    }

    // Always confirm subscription status with backend
    fetchUserFromBackend();

    // Load contests
    loadContests();
  }, [searchParams]);

  const fetchUserFromBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          picture: userData.picture || "",
          subscribed: !!userData.subscribed, // 👈 DB decides
        });
      } else {
        // User not authenticated → redirect
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error fetching user from backend:", error);
      window.location.href = "/";
    }
  };

  const loadContests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contests");
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data.contests) ? data.contests : [];
        const seen = new Set<string>();
        const deduped = list.filter((c: any) => {
          const key = c.id || `${c.platform}:${c.name}:${c.startTime}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setContests(deduped);
      }
    } catch (error) {
      console.error("Error loading contests:", error);
    }
  };

  // Auto-refresh contests every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadContests, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      window.location.href = "/";
    });
  };

  if (!user) {
    return <div className="text-white p-8">Loading...</div>;
  }

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

          <GoogleLoginButton user={user} onLogout={handleLogout} />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6">
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
        <SubscribeButton
          onLoadContests={loadContests}
          initialSubscribed={user.subscribed}
        />

        {/* Contest Calendar Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-12"
        >
          <ContestCalendar contests={contests} />
        </motion.section>

        {/* Contest List Section */}
        <ContestList contests={contests} />
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
