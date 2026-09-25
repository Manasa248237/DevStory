import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { cn } from "../utils/cn.js";

export function ThemeToggle({ className = "", size = "md" }) {
  const { isDark, toggleTheme } = useTheme();

  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer select-none active:scale-95 shadow-xs",
        sizeStyles[size] || sizeStyles.md,
        className
      )}
    >
      {/* Sun Icon (rendered when dark to switch to light) */}
      <Sun
        className={cn(
          iconSizes[size] || iconSizes.md,
          "transition-all duration-300 transform",
          isDark
            ? "rotate-0 scale-100 text-amber-400 fill-amber-400/20"
            : "-rotate-90 scale-0 absolute text-amber-500"
        )}
      />

      {/* Moon Icon (rendered when light to switch to dark) */}
      <Moon
        className={cn(
          iconSizes[size] || iconSizes.md,
          "transition-all duration-300 transform",
          isDark
            ? "rotate-90 scale-0 absolute text-indigo-400"
            : "rotate-0 scale-100 text-indigo-600 fill-indigo-600/10"
        )}
      />
    </button>
  );
}

export default ThemeToggle;
