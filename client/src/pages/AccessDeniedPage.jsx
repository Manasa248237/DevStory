import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-50 rounded-full blur-2xl pointer-events-none" />

        {/* Shield / Warning Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading & Badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 mb-3">
          403 Forbidden
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Access Restricted
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          You do not have administrative privileges to access this area. This section is restricted to DevStory administrators.
        </p>

        {/* Current Account Card */}
        {user && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {user.role || "user"}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            Back to Homepage
          </Link>
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-all hover:border-slate-300 text-center cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
