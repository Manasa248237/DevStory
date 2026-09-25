import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";
import CommentSection from "../components/CommentSection.jsx";
import LikeButton from "../components/LikeButton.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";

export default function ArticleDetailPage() {
  const { idOrSlug } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await articleApi.getByIdOrSlug(idOrSlug);
        if (response.success && response.article) {
          setArticle(response.article);
        } else {
          setError("Article not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load the article.");
      } finally {
        setIsLoading(false);
      }
    };

    if (idOrSlug) {
      fetchArticle();
    }
  }, [idOrSlug]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await articleApi.delete(article.slug || article._id);
      navigate("/articles", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Failed to delete article");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading article..." fullScreen={false} />;
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6">
        <ErrorMessage
          title="Article Not Found"
          message={error || "The article you are trying to view does not exist or has been removed."}
        />
        <div className="text-center">
          <Link to="/articles">
            <Button variant="primary">Return to All Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && article.author && String(user.id || user._id) === String(article.author._id || article.author);
  const canManage = isAuthor || isAdmin;

  const displayDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const readTime = `${Math.max(1, Math.ceil((article.content?.split(/\s+/).length || 100) / 200))} min read`;

  return (
    <article className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header section */}
      <header className="space-y-6 text-center sm:text-left">
        {/* Breadcrumb & Category */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs font-bold">
          <Link to="/articles" className="text-slate-500 hover:text-indigo-600 transition-colors">
            Articles
          </Link>
          <span className="text-slate-300">/</span>
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
            {article.category}
          </span>
          {article.status === "draft" && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white uppercase tracking-wider text-[11px]">
              Draft
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        )}

        {/* Meta Bar & Management Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-b border-slate-200 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-xs">
              {article.author?.name ? article.author.name.charAt(0) : "A"}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {article.author?.name || "Anonymous Author"}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{displayDate}</span>
                <span>•</span>
                <span>{readTime}</span>
                {article.viewCount !== undefined && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.viewCount} views
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions: Like Button, Bookmark Button & Author/Admin Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <LikeButton
              articleId={article._id || idOrSlug}
              initialLikesCount={article.likesCount || 0}
              size="md"
            />
            <BookmarkButton
              articleId={article._id || idOrSlug}
              size="md"
              showText={true}
            />

            {canManage && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <Link to={`/articles/edit/${article.slug || article._id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Featured Thumbnail */}
      {article.thumbnail && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body Content */}
      <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-6">
        {article.content.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="whitespace-pre-line leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Article Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author Profile Bio Card */}
      {article.author && (
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black uppercase shrink-0 shadow-sm">
            {article.author.name?.charAt(0)}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Written by
            </div>
            <h3 className="text-xl font-bold text-slate-900">{article.author.name}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {article.author.bio || "Author and contributor at DevStory sharing practical perspectives on modern software engineering."}
            </p>
          </div>
        </div>
      )}

      {/* Discussion & Comments Section */}
      <CommentSection
        articleId={article._id || idOrSlug}
        articleAuthorId={article.author?._id || article.author}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                Are you sure you want to delete <strong>"{article.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                loading={isDeleting}
                onClick={handleDelete}
              >
                Delete Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
