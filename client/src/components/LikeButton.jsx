import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { likeApi } from "../services/api.js";

export default function LikeButton({
  articleId,
  initialLikesCount = 0,
  initialIsLiked = false,
  size = "md",
  showCount = true,
  className = "",
  onLikeToggle,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(Number(initialLikesCount) || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState("");

  // Sync initial props when articleId or initial values change
  useEffect(() => {
    setLikesCount(Number(initialLikesCount) || 0);
    setIsLiked(Boolean(initialIsLiked));
  }, [initialLikesCount, initialIsLiked]);

  // Fetch true user-specific like status when mounted or user auth changes
  useEffect(() => {
    let isMounted = true;
    if (articleId) {
      likeApi
        .getLikeStatus(articleId)
        .then((res) => {
          if (isMounted && res.success) {
            if (res.likesCount !== undefined) setLikesCount(res.likesCount);
            if (res.isLiked !== undefined) setIsLiked(res.isLiked);
          }
        })
        .catch(() => {
          // Silently fail status fetch, keep default props
        });
    }
    return () => {
      isMounted = false;
    };
  }, [articleId, user]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Unauthenticated users check
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isLoading || !articleId) return;

    setError("");
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    // 2. Optimistic UI update
    const nextIsLiked = !previousIsLiked;
    const nextLikesCount = nextIsLiked
      ? previousLikesCount + 1
      : Math.max(0, previousLikesCount - 1);

    setIsLiked(nextIsLiked);
    setLikesCount(nextLikesCount);
    setIsLoading(true);

    try {
      const response = await likeApi.toggle(articleId);

      if (response && response.success) {
        setIsLiked(response.isLiked);
        setLikesCount(response.likesCount);
        if (onLikeToggle) {
          onLikeToggle(response.isLiked, response.likesCount);
        }
      } else {
        // Rollback on non-success
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
        setError(response.message || "Failed to update like status.");
      }
    } catch (err) {
      // Rollback on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Size variations
  const sizeStyles = {
    sm: {
      button: "px-2.5 py-1 text-xs gap-1.5 rounded-full border",
      icon: "w-3.5 h-3.5",
    },
    md: {
      button: "px-4 py-2 text-sm gap-2 rounded-xl border shadow-xs",
      icon: "w-4 h-4",
    },
    lg: {
      button: "px-5 py-2.5 text-base gap-2.5 rounded-2xl border shadow-sm font-semibold",
      icon: "w-5 h-5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  // Visual state styling
  const stateStyles = isLiked
    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:border-rose-300"
    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700";

  return (
    <>
      <div className="relative inline-flex flex-col items-start">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isLoading}
          aria-label={isLiked ? "Unlike article" : "Like article"}
          className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400/40 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${currentSize.button} ${stateStyles} ${className}`}
        >
          {isLoading ? (
            <svg
              className={`${currentSize.icon} animate-spin text-rose-500`}
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
                isLiked ? "scale-110 fill-rose-500 text-rose-500" : "fill-none text-current"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isLiked ? "0" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}

          {showCount && (
            <span className="font-bold tracking-tight">
              {likesCount}
              <span className="sr-only"> likes</span>
            </span>
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
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <svg className="w-6 h-6 fill-rose-500" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to Like Articles</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Join DevStory to like your favorite engineering stories, save articles, and interact with the developer community.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", { state: { from: location.pathname } });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
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
