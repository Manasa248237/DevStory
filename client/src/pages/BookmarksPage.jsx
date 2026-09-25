import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  ArrowRight,
  BookOpen,
  Sparkles,
  Compass,
  ArrowLeft
} from "lucide-react";
import { bookmarkApi } from "../services/api.js";
import ArticleCard from "../components/ArticleCard.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";
import { SpotlightCard } from "../components/ui/SpotlightCard.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentMeta({
    title: "Saved Bookmarks | DevStory",
    description: "Your personalized reading list and saved technical articles on DevStory.",
  });

  const fetchBookmarks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookmarkApi.getUserBookmarks();
      if (response && response.success) {
        setBookmarks(response.bookmarks || []);
      } else {
        setError(response?.message || "Failed to load bookmarks.");
      }
    } catch (err) {
      setError(err.message || "Failed to load saved bookmarks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (isLoading) {
    return <Loading message="Loading your saved bookmarks..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        <ErrorMessage
          title="Error Loading Bookmarks"
          message={error}
          onRetry={fetchBookmarks}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400" />
            <span>Personal Reading Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {bookmarks.length === 1
              ? "You have 1 saved article for quick reference."
              : `You have ${bookmarks.length} saved articles in your personal reading queue.`}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Link to="/articles">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <Compass className="w-4 h-4" />
              <span>Explore More Stories</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Empty State */}
      {bookmarks.length === 0 ? (
        <SpotlightCard className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <Bookmark className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              No saved articles yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              When you find a tutorial, deep-dive, or architectural guide you want to read later, tap the bookmark icon on any article card to save it here.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/articles">
              <Button variant="primary" size="md" className="gap-2 shadow-md shadow-indigo-500/20">
                <span>Browse All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </SpotlightCard>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {bookmarks.map((bookmark) => {
            const article = bookmark.article;
            if (!article) return null;

            return (
              <div key={bookmark._id || article._id} className="relative">
                <ArticleCard article={article} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
