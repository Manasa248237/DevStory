import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  Edit3,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { sanitizeArticleContent } from "../utils/sanitizeHtml.js";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import CommentSection from "../components/CommentSection.jsx";
import LikeButton from "../components/LikeButton.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import SocialShare from "../components/SocialShare.jsx";
import ArticleCard, { DEFAULT_ARTICLE_THUMBNAIL } from "../components/ArticleCard.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";
import { calculateReadingTime } from "../utils/readingTime.js";

export default function ArticleDetailPage() {
  const { idOrSlug } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [thumbnailSrc, setThumbnailSrc] = useState(DEFAULT_ARTICLE_THUMBNAIL);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  // Dynamic SEO, Open Graph & Twitter metadata
  useDocumentMeta(
    article
      ? {
          title: article.title,
          description:
            article.excerpt ||
            (article.content ? article.content.replace(/<[^>]*>/gm, " ").trim().slice(0, 160) : ""),
          url:
            typeof window !== "undefined"
              ? `${window.location.origin}/articles/${article.slug || article._id}`
              : "",
          image: article.thumbnail || DEFAULT_ARTICLE_THUMBNAIL,
          type: "article",
          author: article.author?.name || "DevStory Author",
          section: article.category || "Technology",
          publishedTime: article.createdAt,
          modifiedTime: article.updatedAt,
          tags: article.tags,
        }
      : error
      ? {
          title: "Article Not Found",
          description: "The requested article could not be found on DevStory.",
        }
      : {
          title: "Loading Article...",
          description: "Reading engineering journal article on DevStory.",
        }
  );

  useEffect(() => {
    if (article) {
      setThumbnailSrc(article.thumbnail || DEFAULT_ARTICLE_THUMBNAIL);
    }
  }, [article?.thumbnail]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await articleApi.getByIdOrSlug(idOrSlug);
        if (response.success && response.article) {
          setArticle(response.article);
          
          // Seamless SEO URL canonicalization: if accessed via MongoDB ObjectId, replace with clean slug in address bar
          if (response.article.slug && idOrSlug !== response.article.slug) {
            navigate(`/articles/${response.article.slug}`, { replace: true });
          }

          fetchRelated(response.article.slug || response.article._id || idOrSlug);
        } else {
          setError("Article not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load the article.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelated = async (targetIdOrSlug) => {
      setIsLoadingRelated(true);
      setRelatedError(null);
      try {
        const res = await articleApi.getRelated(targetIdOrSlug, 3);
        if (res.success && Array.isArray(res.articles)) {
          setRelatedArticles(res.articles);
        } else {
          setRelatedArticles([]);
        }
      } catch (err) {
        console.error("Failed to load related articles:", err);
        setRelatedError(err.message || "Failed to load related articles.");
        setRelatedArticles([]);
      } finally {
        setIsLoadingRelated(false);
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
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to All Articles</span>
            </Button>
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

  // Estimated reading time
  const readTime = article.readTime || calculateReadingTime(article.content);

  // Detect whether content contains HTML tags
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(article.content || "");
  const sanitizedHtml = isHtmlContent ? sanitizeArticleContent(article.content) : "";

  return (
    <article className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header section */}
      <header className="space-y-6 text-center sm:text-left">
        {/* Breadcrumb & Category */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs font-bold">
          <Link
            to="/articles"
            className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Articles
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Badge variant="default" className="uppercase tracking-wider">
            {article.category}
          </Badge>
          {article.status === "draft" && (
            <Badge variant="warning" className="uppercase tracking-wider text-[11px]">
              Draft
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        )}

        {/* Meta Bar & Management Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-b border-slate-200/80 dark:border-slate-800/80 py-4">
          <div className="flex items-center gap-3">
            {article.author?.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name || "Author"}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-xs">
                {article.author?.name ? article.author.name.charAt(0) : "A"}
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {article.author?.name || "Anonymous Author"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {displayDate}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTime}
                </span>
                {article.viewCount !== undefined && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{article.viewCount.toLocaleString()} {article.viewCount === 1 ? "view" : "views"}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions: Like Button, Bookmark Button, Share Button & Author/Admin Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
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
            {article.status === "published" && (
              <SocialShare
                article={article}
                variant="compact"
              />
            )}

            {canManage && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                <Link to={`/articles/edit/${article.slug || article._id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Featured Thumbnail */}
      <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-800">
        <img
          src={thumbnailSrc}
          alt={article.title ? `${article.title} cover image` : "Article cover image"}
          onError={() => setThumbnailSrc(DEFAULT_ARTICLE_THUMBNAIL)}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Body Content */}
      <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-4">
        {isHtmlContent ? (
          <div
            className="tiptap-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          article.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-base sm:text-lg leading-relaxed">
              {paragraph}
            </p>
          ))
        )}
      </div>

      {/* Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
            Tags:
          </span>
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Full Social Sharing Section (Published Articles Only) */}
      {article.status === "published" && (
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800">
          <SocialShare article={article} variant="full" />
        </div>
      )}

      {/* Related Articles Section */}
      <section className="pt-10 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Stories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Related Articles
            </h2>
          </div>
          {article.category && (
            <Link
              to={`/articles?category=${encodeURIComponent(article.category)}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <span>More in {article.category}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {isLoadingRelated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/60 dark:border-slate-700/60"
              />
            ))}
          </div>
        ) : relatedError ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            {relatedError}
          </div>
        ) : relatedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relArticle) => (
              <ArticleCard key={relArticle._id || relArticle.slug} article={relArticle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No related articles found in <strong>{article.category || "this topic"}</strong> yet.
            </p>
            <Link to="/articles">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>Browse All Articles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Comments Section */}
      <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800">
        <CommentSection articleId={article._id || idOrSlug} />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Delete Article?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <strong>"{article.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDelete}
                loading={isDeleting}
                disabled={isDeleting}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
