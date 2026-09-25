import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function AdminAuthCheckPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            👑
          </div>
          <div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Admin Area
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Authorized
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              Admin role and authorization verified for <strong>{user?.name}</strong> ({user?.email}).
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
            Authorization Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">User ID:</span>
              <p className="font-mono text-xs text-slate-800 mt-0.5">{user?.id || user?._id}</p>
            </div>
            <div>
              <span className="text-slate-500">Assigned Role:</span>
              <p className="font-semibold text-indigo-600 capitalize mt-0.5">{user?.role}</p>
            </div>
            <div>
              <span className="text-slate-500">Email:</span>
              <p className="text-slate-800 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-500">Privileges:</span>
              <p className="text-emerald-600 font-semibold mt-0.5">Full Administrative Access</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/my-articles"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
          >
            My Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
