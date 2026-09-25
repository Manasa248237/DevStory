import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn.js";

export function Loading({
  size = "md",
  message = "Loading content...",
  fullScreen = false,
  className = "",
}) {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-11 h-11",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
    : "py-12 px-4 flex flex-col items-center justify-center text-center";

  return (
    <div
      className={cn(containerClasses, className)}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn(
          sizeMap[size] || sizeMap.md,
          "animate-spin text-indigo-600 dark:text-indigo-400 mb-3"
        )}
      />
      {message && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default Loading;
