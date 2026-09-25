import React from "react";

export default function Loading({
  size = "md",
  message = "Loading content...",
  fullScreen = false,
}) {
  const sizeMap = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-4"
    : "py-12 px-4 flex flex-col items-center justify-center text-center";

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 animate-spin mb-3`}
      />
      {message && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
