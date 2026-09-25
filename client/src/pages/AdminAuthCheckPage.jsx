import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import AdminContactMessages from "../components/AdminContactMessages.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function AdminAuthCheckPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("messages");

  useDocumentMeta({
    title: "Admin Command Center | DevStory",
    description: "DevStory administrative console and message center.",
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20 shrink-0">
              👑
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Admin Console
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Authorized
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                Welcome back, <strong>{user?.name}</strong> ({user?.email}). Manage inquiries and system operations.
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/articles/create"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              + New Article
            </Link>
            <Link
              to="/my-articles"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              My Articles
            </Link>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "messages"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact Messages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Authorization & Privileges</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "messages" ? (
        <AdminContactMessages />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            System & Role Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400 text-xs">User ID:</span>
              <p className="font-mono text-xs text-slate-800 dark:text-slate-200 mt-1">{user?.id || user?._id}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400 text-xs">Assigned Role:</span>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize mt-1">{user?.role}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400 text-xs">Email Account:</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium mt-1">{user?.email}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400 text-xs">Privileges:</span>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Full Administrative Access</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
