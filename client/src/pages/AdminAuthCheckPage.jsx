import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Plus,
  FileText,
  Mail,
  Key,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  Layers,
  Fingerprint
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AdminContactMessages from "../components/AdminContactMessages.jsx";
import Button from "../components/Button.jsx";
import { SpotlightCard } from "../components/ui/SpotlightCard.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function AdminAuthCheckPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("messages");

  useDocumentMeta({
    title: "Admin Command Center | DevStory",
    description: "DevStory administrative console, system settings, and audience message center.",
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner Header */}
      <SpotlightCard className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Admin Console
                </h1>
                <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
                  Verified Clearance
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                Welcome back, <strong>{user?.name}</strong> ({user?.email}). Manage inquiries and system operations.
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2.5">
            <Link to="/articles/create">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-md shadow-indigo-500/20">
                <Plus className="w-4 h-4" />
                <span>New Story</span>
              </Button>
            </Link>
            <Link to="/my-articles">
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="w-4 h-4" />
                <span>My Articles</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "messages"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Inquiries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "overview"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Role & System Credentials</span>
          </button>
        </div>
      </SpotlightCard>

      {/* Tab Panels */}
      {activeTab === "messages" ? (
        <AdminContactMessages />
      ) : (
        <SpotlightCard className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              System & Role Authorization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active security token payload and administrator privileges for this session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Account ID</span>
              <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">{user?.id || user?._id}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Assigned Role</span>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{user?.role}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Verified Email</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">{user?.email}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Clearance Status</span>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Full Administrative Access</span>
              </p>
            </div>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
