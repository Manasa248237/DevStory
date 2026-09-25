import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookmarkApi } from "../services/api.js";
import ArticleCard from "../components/ArticleCard.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleRemoveBookmark = (articleId) => {
    setBookmarks((prev) => prev.filter((b) => b.article && String(b.article._id || b.article.id || b.article.slug) !== String(articleId)));
  };

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
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <svg className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            Personal Library
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {bookmarks.length === 1
              ? "You have 1 saved article for quick reading."
              : `You have ${bookmarks.length} saved articles in your personal collection.`}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Link to="/articles">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m7 7l-7-7 7-7" />
              </svg>
              Explore More Articles
            </Button>
          </Link>
        )}
      </div>

      {/* Empty State */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <svg className="w-8 h-8 fill-none text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No saved articles yet</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              When you find an article you want to read later, click the bookmark icon on any article card or detail page to save it here.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/articles">
              <Button variant="primary" size="md" className="gap-2">
                <span>Browse All Articles</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
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
