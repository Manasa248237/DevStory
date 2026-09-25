import React, { useState } from "react";
import Button from "./Button.jsx";

export default function CommentItem({
  comment,
  articleAuthorId,
  currentUserId,
  isAdmin,
  onUpdate,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const commentUserId = comment.user?._id || comment.user?.id || comment.user;
  const isCommentOwner =
    currentUserId && String(currentUserId) === String(commentUserId);
  const isArticleAuthor =
    currentUserId && String(currentUserId) === String(articleAuthorId);

  const canEdit = isCommentOwner || isAdmin;
  const canDelete = isCommentOwner || isArticleAuthor || isAdmin;

  const isAuthorOfArticle =
    commentUserId && String(commentUserId) === String(articleAuthorId);

  const formattedDate = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const trimmed = editContent.trim();

    if (!trimmed) {
      setEditError("Comment content cannot be empty.");
      return;
    }

    if (trimmed.length > 1000) {
      setEditError("Comment content cannot exceed 1000 characters.");
      return;
    }

    setIsSaving(true);
    setEditError("");
    try {
      await onUpdate(comment._id, trimmed);
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message || "Failed to update comment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content || "");
    setEditError("");
    setIsEditing(false);
  };

  const ConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await onDelete(comment._id);
      setShowDeleteModal(false);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete comment.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Header Row: User Avatar, Name, Badges, Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* User Avatar with fallback */}
          {comment.user?.avatar ? (
            <img
              src={comment.user.avatar}
              alt={comment.user.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center uppercase shrink-0 shadow-2xs">
              {comment.user?.name ? comment.user.name.charAt(0) : "U"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {comment.user?.name || "Anonymous User"}
              </span>

              {/* Author / Role Badges */}
              {isAuthorOfArticle && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Author
                </span>
              )}

              {comment.user?.role === "admin" && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>

            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Edit / Delete Action Buttons */}
        {!isEditing && (canEdit || canDelete) && (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(comment.content || "");
                  setEditError("");
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                title="Edit Comment"
                aria-label="Edit comment"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Comment"
                aria-label="Delete comment"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body Section: Read View OR Edit Form */}
      {!isEditing ? (
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-1 sm:pl-12">
          {comment.content}
        </p>
      ) : (
        <form onSubmit={handleSaveEdit} className="space-y-3 pt-2 pl-1 sm:pl-12">
          {editError && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {editError}
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Edit your comment..."
            />
            <div className="text-right text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
              {editContent.length} / 1000
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSaving}
              disabled={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Delete Comment?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-medium text-center">
                {deleteError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                loading={isDeleting}
                onClick={ConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
