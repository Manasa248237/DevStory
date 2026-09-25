import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../utils/cn.js";

export function Input({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  helperText = "",
  icon = null,
  rightElement = null,
  className = "",
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={cn(
            "w-full rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-400 disabled:cursor-not-allowed",
            icon ? "pl-10" : "px-3.5",
            rightElement ? "pr-10" : "pr-3.5",
            "py-2.5",
            error
              ? "border-rose-300 dark:border-rose-800/80 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100"
              : "border-slate-300 dark:border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400 dark:hover:border-slate-600 shadow-xs"
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p
          id={`${inputId}-helper`}
          className="text-xs text-slate-500 dark:text-slate-400 mt-1"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
