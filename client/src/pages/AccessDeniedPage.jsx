import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Home, LogOut, User, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import { SpotlightCard } from "../components/ui/SpotlightCard.jsx";
import { GridPattern } from "../components/ui/GridPattern.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useDocumentMeta({
    title: "403 - Access Restricted | DevStory",
    description: "You do not have administrative clearance to access this sector.",
  });

  const handleSwitchAccount = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      <GridPattern className="opacity-40" />

      <SpotlightCard className="relative z-10 max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-8 sm:p-10 text-center">
        {/* Shield / Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Badge */}
        <div className="space-y-3 mb-6">
          <Badge variant="danger" className="text-xs font-bold uppercase tracking-wider px-3 py-1">
            403 Forbidden
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Access Restricted
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            You do not have administrative privileges to access this area. This console is strictly reserved for DevStory platform administrators.
          </p>
        </div>

        {/* Current Account Card */}
        {user && (
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 text-left flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                  {user.role || "user"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" fullWidth className="gap-2 shadow-md shadow-indigo-500/20">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={handleSwitchAccount}
            className="w-full sm:w-auto gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account</span>
          </Button>
        </div>
      </SpotlightCard>
    </div>
  );
}
