import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { bookmarkApi } from "../services/api.js";

export default function BookmarkButton({
  articleId,
  initialIsBookmarked = false,
  size = "md",
  showText = false,
  className = "",
  onBookmarkToggle,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isBookmarked, setIsBookmarked] = useState(Boolean(initialIsBookmarked));
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState("");

  // Sync initial props when articleId or initial values change
  useEffect(() => {
    setIsBookmarked(Boolean(initialIsBookmarked));
  }, [initialIsBookmarked]);

  // Fetch true user-specific bookmark status when mounted or user auth changes
  useEffect(() => {
    let isMounted = true;
    if (articleId && user) {
      bookmarkApi
        .getBookmarkStatus(articleId)
        .then((res) => {
          if (isMounted && res.success && res.isBookmarked !== undefined) {
            setIsBookmarked(res.isBookmarked);
          }
        })
        .catch(() => {
          // Silently fail status fetch, keep default props
        });
    } else if (!user) {
      setIsBookmarked(false);
    }
    return () => {
      isMounted = false;
    };
  }, [articleId, user]);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Unauthenticated users check
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isLoading || !articleId) return;

    setError("");
    const previousState = isBookmarked;
    const nextState = !previousState;

    // 2. Optimistic UI update
    setIsBookmarked(nextState);
    setIsLoading(true);

    try {
      const response = await bookmarkApi.toggle(articleId);

      if (response && response.success) {
        setIsBookmarked(response.isBookmarked);
        if (onBookmarkToggle) {
          onBookmarkToggle(response.isBookmarked);
        }
      } else {
        // Rollback on non-success
        setIsBookmarked(previousState);
        setError(response.message || "Failed to update bookmark.");
      }
    } catch (err) {
      // Rollback on error
      setIsBookmarked(previousState);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Size variations
  const sizeStyles = {
    sm: {
      button: "p-1.5 text-xs gap-1 rounded-full border",
      icon: "w-3.5 h-3.5",
    },
    md: {
      button: "px-3 py-2 text-sm gap-1.5 rounded-xl border shadow-xs font-medium",
      icon: "w-4 h-4",
    },
    lg: {
      button: "px-4 py-2.5 text-base gap-2 rounded-2xl border shadow-sm font-semibold",
      icon: "w-5 h-5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  // Visual state styling
  const stateStyles = isBookmarked
    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:border-indigo-300"
    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700";

  return (
    <>
      <div className="relative inline-flex flex-col items-start">
        <button
          type="button"
          onClick={handleToggleBookmark}
          disabled={isLoading}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
          title={isBookmarked ? "Remove bookmark" : "Save article to bookmarks"}
          className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${currentSize.button} ${stateStyles} ${className}`}
        >
          {isLoading ? (
            <svg
              className={`${currentSize.icon} animate-spin text-indigo-600 dark:text-indigo-400`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className={`${currentSize.icon} transition-transform duration-200 ${
                isBookmarked
                  ? "scale-110 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400"
                  : "fill-none text-current"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isBookmarked ? "0" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          )}

          {showText && (
            <span>{isBookmarked ? "Saved" : "Save"}</span>
          )}
        </button>

        {error && (
          <span className="absolute top-full left-0 mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap z-10 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 shadow-xs">
            {error}
          </span>
        )}
      </div>

      {/* Unauthenticated User Prompt Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
              <svg className="w-6 h-6 fill-indigo-600 dark:fill-indigo-400" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to Save Articles</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Bookmark your favorite articles to easily read them later and keep your personal learning library organized.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", { state: { from: location.pathname } });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
