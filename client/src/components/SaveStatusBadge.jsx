import React from "react";
import { Check, Loader2, AlertCircle, CloudOff, RefreshCw } from "lucide-react";

/**
 * SaveStatusBadge Component
 * 
 * Displays the current auto-save state:
 * - 'saving': Spinner with "Saving draft..."
 * - 'saved': Check icon with "Draft saved at HH:MM:SS"
 * - 'unsaved': Amber dot with "Unsaved changes"
 * - 'error': Rose icon with "Save failed" + retry button
 */
export default function SaveStatusBadge({
  status = "idle", // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  lastSavedTime = null,
  errorMessage = "",
  onRetry = null,
  className = "",
}) {
  const formatTime = (date) => {
    if (!date) return "";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  if (status === "idle" && !lastSavedTime) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-2xs ${
        status === "saving"
          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80"
          : status === "saved"
          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
          : status === "unsaved"
          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80"
          : status === "error"
          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>Saving draft...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Saved {lastSavedTime ? `at ${formatTime(lastSavedTime)}` : ""}</span>
        </>
      )}

      {status === "unsaved" && (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Unsaved changes</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-[200px]" title={errorMessage || "Auto-save failed"}>
            Save failed (saved locally)
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 inline-flex items-center gap-1 text-rose-800 dark:text-rose-200 underline hover:no-underline font-semibold cursor-pointer"
              title="Retry saving to server"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </>
      )}

      {status === "idle" && lastSavedTime && (
        <>
          <Check className="w-3.5 h-3.5 text-slate-500" />
          <span>Last saved {formatTime(lastSavedTime)}</span>
        </>
      )}
    </div>
  );
}
