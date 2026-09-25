import React from "react";
import { cn } from "../../utils/cn.js";

/**
 * GridPattern - Subtle background grid with radial fade mask
 * Creates high-end developer portal visual depth without performance cost.
 */
export function GridPattern({
  width = 32,
  height = 32,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  className = "",
  ...props
}) {
  const id = React.useId();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <svg
        className="absolute inset-0 h-full w-full stroke-slate-300/40 dark:stroke-slate-800/60"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <path
              d={`M.5 ${height}V.5H${width}`}
              fill="none"
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

export default GridPattern;
