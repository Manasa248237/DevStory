import React from "react";
import Button from "./Button.jsx";

export default function ErrorMessage({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-slate-800 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-bold text-rose-900">{title}</h4>
          <p className="text-sm text-rose-700 leading-relaxed">{message}</p>
          {onRetry && (
            <div className="pt-2">
              <Button size="sm" variant="danger" onClick={onRetry}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
