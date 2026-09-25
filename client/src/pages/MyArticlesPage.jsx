import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  BookOpen,
  TrendingUp,
  Clock,
  ExternalLink
} from "lucide-react";
import { articleApi } from "../services/api.js";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { SpotlightCard } from "../components/ui/SpotlightCard.jsx";
import { ShinyText } from "../components/ui/ShinyText.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  useDocumentMeta({
    title: "My Articles | DevStory Creator Hub",
    description: "Manage your published stories, drafts, and article performance on DevStory.",
  });

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
        text: `Article "${articleToDelete.title}" was permanently deleted.`,
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

  // Metrics
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  const filteredArticles = articles.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Author Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Articles
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Manage your published stories, editorial drafts, and audience engagement metrics.
          </p>
        </div>
        <Link to="/articles/create">
          <Button variant="primary" size="md" className="gap-2 shadow-md shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Stories</span>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {totalArticles}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
              {publishedCount}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Drafts</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
              {draftCount}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Reads</span>
              <TrendingUp className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 mt-2">
              {totalViews.toLocaleString()}
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionMessage.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 border shadow-xs animate-fadeIn ${
            actionMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage({ type: "", text: "" })}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <Loading message="Loading your articles..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Articles" message={error} onRetry={fetchMyArticles} />
      ) : articles.length === 0 ? (
        <SpotlightCard className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              You haven't published any stories yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Start sharing your engineering discoveries, architecture lessons, and software guides with the global community.
            </p>
          </div>
          <Link to="/articles/create">
            <Button variant="primary" size="md" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Your First Article</span>
            </Button>
          </Link>
        </SpotlightCard>
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All ({articles.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === "published"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === "draft"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing {filteredArticles.length} of {articles.length}
            </span>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60">
                    <th className="py-4 px-6">Article</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Views</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredArticles.map((article) => {
                    const displayDate = article.createdAt
                      ? new Date(article.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently";

                    const articleSlug = article.slug || article._id;

                    return (
                      <tr key={article._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white max-w-sm">
                          <Link
                            to={`/articles/${articleSlug}`}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                          >
                            <span className="truncate">{article.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity shrink-0" />
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-[11px] font-semibold capitalize">
                            {article.category || "General"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={article.status === "published" ? "success" : "warning"}
                            className="text-[10px] font-bold uppercase tracking-wider"
                          >
                            {article.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {article.viewCount || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {displayDate}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/articles/edit/${articleSlug}`}>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                                title="Edit Article"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setArticleToDelete(article)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete this article?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently remove <strong>"{articleToDelete.title}"</strong>? This will also remove all associated likes, comments, and bookmarks.
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
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
