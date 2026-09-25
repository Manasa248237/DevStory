import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./Button.jsx";
import { cn } from "../utils/cn.js";

export function ErrorMessage({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200/90 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 p-6 text-slate-800 dark:text-slate-200 shadow-xs",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1.5">
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            {title}
          </h4>
          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="pt-2.5">
              <Button
                size="sm"
                variant="danger"
                onClick={onRetry}
                className="gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
