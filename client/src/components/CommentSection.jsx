import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { commentApi } from "../services/api.js";
import CommentItem from "./CommentItem.jsx";
import Button from "./Button.jsx";
import Loading from "./Loading.jsx";
import ErrorMessage from "./ErrorMessage.jsx";

export default function CommentSection({ articleId, articleAuthorId }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Comment Form state
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await commentApi.getByArticle(articleId);
      if (response.success && Array.isArray(response.comments)) {
        setComments(response.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load comments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    const trimmed = newContent.trim();

    if (!trimmed) {
      setSubmitError("Comment content cannot be empty.");
      return;
    }

    if (trimmed.length > 1000) {
      setSubmitError("Comment content cannot exceed 1000 characters.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      const response = await commentApi.create(articleId, { content: trimmed });
      if (response.success && response.comment) {
        setComments((prev) => [response.comment, ...prev]);
        setNewContent("");
        setSubmitSuccess("Comment posted successfully!");
        setTimeout(() => setSubmitSuccess(""), 4000);
      }
    } catch (err) {
      setSubmitError(err.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, updatedContent) => {
    const response = await commentApi.update(commentId, { content: updatedContent });
    if (response.success && response.comment) {
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? response.comment : c))
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    const response = await commentApi.delete(commentId);
    if (response.success) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  };

  return (
    <section className="space-y-8 pt-8 border-t border-slate-200" aria-label="Comments section">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Discussion ({comments.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Share your thoughts, ask questions, or contribute to the topic.
            </p>
          </div>
        </div>
      </div>

      {/* Add Comment Form or Sign In Prompt */}
      {isAuthenticated ? (
        <form onSubmit={handleCreateComment} className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <label htmlFor="newComment" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Leave a Comment
            </label>
            <span className={`text-xs font-mono font-medium ${newContent.length > 1000 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
              {newContent.length} / 1000
            </span>
          </div>

          {submitSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {submitError}
            </div>
          )}

          <textarea
            id="newComment"
            rows={3}
            value={newContent}
            onChange={(e) => {
              setNewContent(e.target.value);
              if (submitError) setSubmitError("");
            }}
            placeholder="Write a constructive comment..."
            className="w-full p-3.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition-all"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center uppercase">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-600">
                Commenting as <strong className="text-slate-900">{user?.name}</strong>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="gap-2 shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-violet-50/70 to-purple-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              Join the Conversation
            </h4>
            <p className="text-xs text-slate-600">
              Sign in to your DevStory account to post comments, ask questions, and engage with the author.
            </p>
          </div>
          <Link to="/login" state={{ from: location }}>
            <Button variant="primary" size="md" className="shrink-0 gap-1.5 shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Comment List */}
      {isLoading ? (
        <Loading message="Loading comments..." />
      ) : error ? (
        <ErrorMessage
          title="Could Not Load Comments"
          message={error}
          onRetry={fetchComments}
        />
      ) : comments.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-slate-800">No comments yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to share your thoughts on this story!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              articleAuthorId={articleAuthorId}
              currentUserId={user?.id || user?._id}
              isAdmin={isAdmin}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </section>
  );
}
