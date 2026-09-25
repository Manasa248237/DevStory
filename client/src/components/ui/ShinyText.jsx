import React from "react";
import { cn } from "../../utils/cn.js";

/**
 * ShinyText - React Bits inspired component
 * Renders text with a subtle metallic/gradient shimmer animation across its surface.
 */
export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
  children,
}) {
  const content = children || text;

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent transition-all",
        disabled
          ? "text-slate-900 dark:text-white"
          : "bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 dark:from-slate-100 dark:via-indigo-300 dark:to-slate-100 animate-shimmer bg-[length:200%_auto]",
        className
      )}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {content}
    </span>
  );
}

export default ShinyText;
