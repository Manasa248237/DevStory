import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articleApi } from "../services/api.js";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  const fetchMyArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleApi.getMyArticles();
      if (response.success && response.articles) {
        setArticles(response.articles);
      }
    } catch (err) {
      setError(err.message || "Failed to load your articles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyArticles();
  }, []);

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    const idOrSlug = articleToDelete.slug || articleToDelete._id;
    setDeletingId(idOrSlug);
    setActionMessage({ type: "", text: "" });

    try {
      await articleApi.delete(idOrSlug);
      setArticles((prev) => prev.filter((a) => a.slug !== idOrSlug && a._id !== idOrSlug));
      setActionMessage({
        type: "success",
        text: `Article "${articleToDelete.title}" was successfully deleted.`,
      });
      setArticleToDelete(null);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to delete the article.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Articles
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your published stories, drafts, and editing history.
          </p>
        </div>
        <Link to="/articles/create">
          <Button variant="primary" size="md" className="gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write New Article
          </Button>
        </Link>
      </div>

      {/* Action Notification Banner */}
      {actionMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 border ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage({ type: "", text: "" })}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <Loading message="Loading your articles..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Articles" message={error} onRetry={fetchMyArticles} />
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">You haven't written any articles yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Start sharing your thoughts, knowledge, and perspectives with the community.
          </p>
          <Link to="/articles/create">
            <Button variant="primary" size="md">
              Create Your First Article
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase font-bold text-slate-700 bg-slate-50/80">
                  <th className="py-3.5 px-6">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((article) => {
                  const displayDate = article.createdAt
                    ? new Date(article.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently";

                  const articleSlug = article.slug || article._id;

                  return (
                    <tr key={article._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate">
                        <Link
                          to={`/articles/${articleSlug}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                        {article.category}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            article.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {article.viewCount || 0}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {displayDate}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/articles/edit/${articleSlug}`}>
                            <button
                              type="button"
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(article)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Delete this article?</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <strong>"{articleToDelete.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                disabled={Boolean(deletingId)}
                onClick={() => setArticleToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                loading={Boolean(deletingId)}
                onClick={confirmDelete}
              >
                Delete Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
