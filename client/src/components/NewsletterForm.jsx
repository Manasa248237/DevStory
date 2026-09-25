import React, { useState } from "react";
import { newsletterApi } from "../services/api.js";
import Button from "./Button.jsx";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

export default function NewsletterForm({
  source = "website_homepage",
  variant = "card", // "card" | "inline" | "compact"
  className = "",
  onSuccess,
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [apiResponse, setApiResponse] = useState(null); // { type: "success" | "info" | "error", message: string }

  const validate = (value) => {
    if (!value || !value.trim()) {
      return "Email address is required.";
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
    if (apiResponse) {
      setApiResponse(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate(email);
    if (err) {
      setValidationError(err);
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setValidationError("");
    setApiResponse(null);

    try {
      const response = await newsletterApi.subscribe(email.trim(), source);

      if (response && response.success) {
        if (response.isDuplicate) {
          setApiResponse({
            type: "info",
            message: response.message || "You are already subscribed to our newsletter.",
          });
        } else {
          setApiResponse({
            type: "success",
            message: response.message || "Thank you for subscribing to the DevStory newsletter!",
          });
          setEmail(""); // Clear email on fresh subscription
        }

        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        setApiResponse({
          type: "error",
          message: response?.message || "Failed to subscribe. Please try again.",
        });
      }
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.message || "Unable to connect to the server. Please check your network.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compact variant (e.g. for Footer)
  if (variant === "compact") {
    return (
      <div className={`space-y-3 ${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-lg text-xs text-slate-100 bg-slate-800 border border-slate-700 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="shrink-0 text-xs px-4"
          >
            Subscribe
          </Button>
        </form>

        {validationError && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <span>{validationError}</span>
          </p>
        )}

        {apiResponse && (
          <div
            className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              apiResponse.type === "success"
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                : apiResponse.type === "info"
                ? "bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                : "bg-rose-950/60 text-rose-300 border border-rose-800/60"
            }`}
          >
            <span>{apiResponse.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Card variant (e.g. for HomePage Teaser section)
  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            disabled={isSubmitting}
            aria-label="Email address for newsletter"
            className={`w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all ${
              validationError
                ? "border-2 border-rose-400 focus:ring-rose-400/40"
                : "focus:ring-indigo-400"
            }`}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="bg-indigo-500 hover:bg-indigo-600 shadow-md py-3 shrink-0"
        >
          Subscribe
        </Button>
      </form>

      {/* Validation Error Message */}
      {validationError && (
        <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{validationError}</span>
        </p>
      )}

      {/* API Feedback Alert */}
      {apiResponse && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 max-w-lg shadow-sm animate-fadeIn ${
            apiResponse.type === "success"
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
              : apiResponse.type === "info"
              ? "bg-sky-500/20 text-sky-200 border border-sky-400/40"
              : "bg-rose-500/20 text-rose-200 border border-rose-400/40"
          }`}
        >
          {apiResponse.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : apiResponse.type === "info" ? (
            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="leading-snug">{apiResponse.message}</span>
        </div>
      )}
    </div>
  );
}
