import React, { useState, useEffect, useCallback } from "react";
import { contactApi } from "../services/api.js";
import Button from "./Button.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import Loading from "./Loading.jsx";

const STATUS_CONFIG = {
  unread: {
    label: "Unread",
    badgeClass: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    dotClass: "bg-indigo-600 dark:bg-indigo-400",
  },
  read: {
    label: "Read",
    badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-400",
  },
  replied: {
    label: "Replied",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  archived: {
    label: "Archived",
    badgeClass: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
};

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected message for detailed view modal
  const [activeMessage, setActiveMessage] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const res = await contactApi.getMessages(params);
      if (res.success) {
        setMessages(res.messages || []);
        setTotal(res.total || 0);
        setUnreadCount(res.unreadCount || 0);
      } else {
        setError(res.message || "Failed to load messages.");
      }
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      setError(err.message || "Could not retrieve contact messages.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, debouncedSearch]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleOpenMessage = async (msg) => {
    setActiveMessage(msg);
    setActionSuccessMsg("");

    // Automatically mark as read if it is currently unread
    if (msg.status === "unread") {
      try {
        const updateRes = await contactApi.updateStatus(msg._id, "read");
        if (updateRes.success) {
          setMessages((prev) =>
            prev.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          setActiveMessage((prev) => (prev ? { ...prev, status: "read" } : null));
        }
      } catch (err) {
        console.warn("Could not auto-mark message as read:", err.message);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeMessage || activeMessage.status === newStatus) return;
    setIsUpdatingStatus(true);
    setActionSuccessMsg("");

    try {
      const res = await contactApi.updateStatus(activeMessage._id, newStatus);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === activeMessage._id ? { ...m, status: newStatus } : m))
        );
        setActiveMessage((prev) => ({ ...prev, status: newStatus }));
        setActionSuccessMsg(`Status updated to "${newStatus}"`);
        setTimeout(() => setActionSuccessMsg(""), 3000);

        // Update unread count if transitioning to/from unread
        if (activeMessage.status === "unread" && newStatus !== "unread") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else if (activeMessage.status !== "unread" && newStatus === "unread") {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await contactApi.deleteMessage(deleteTarget._id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget._id));
        setTotal((prev) => Math.max(0, prev - 1));
        if (deleteTarget.status === "unread") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        if (activeMessage?._id === deleteTarget._id) {
          setActiveMessage(null);
        }
        setDeleteTarget(null);
      } else {
        setDeleteError(res.message || "Failed to delete message");
      }
    } catch (err) {
      setDeleteError(err.message || "Unable to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusTabs = [
    { key: "all", label: "All Messages", count: total },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read" },
    { key: "replied", label: "Replied" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Contact Inquiries Inbox
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, reply to, and manage communications submitted through the DevStory contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search sender, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            title="Refresh inbox"
            className="p-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === tab.key
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedStatus === tab.key
                    ? "bg-white text-indigo-700"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Message List / Content Area */}
      {isLoading ? (
        <Loading message="Loading messages..." fullScreen={false} />
      ) : error ? (
        <div className="space-y-3">
          <ErrorMessage title="Failed to Load Messages" message={error} />
          <Button variant="primary" size="sm" onClick={fetchMessages}>
            Retry
          </Button>
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No contact messages found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {selectedStatus !== "all" || debouncedSearch
              ? "No messages match your active filter or search keyword."
              : "Your inbox is clear. Messages submitted through the contact page will appear here."}
          </p>
          {(selectedStatus !== "all" || debouncedSearch) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStatus("all");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const config = STATUS_CONFIG[msg.status] || STATUS_CONFIG.unread;
            const isUnread = msg.status === "unread";

            return (
              <div
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? "bg-white dark:bg-slate-900 border-indigo-200/90 dark:border-indigo-900/60 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-700"
                    : "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Sender & Subject */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="pt-1">
                      <span className={`w-2.5 h-2.5 rounded-full block ${config.dotClass}`} />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-bold truncate ${isUnread ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-800 dark:text-slate-200"}`}>
                          {msg.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          &lt;{msg.email}&gt;
                        </span>
                        {msg.user && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                            Member
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.badgeClass}`}>
                          {config.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {msg.subject}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  {/* Date & Quick Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 pt-2 sm:pt-0">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(msg);
                      }}
                      title="Delete message"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Detail View Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${(STATUS_CONFIG[activeMessage.status] || STATUS_CONFIG.unread).badgeClass}`}>
                    {(STATUS_CONFIG[activeMessage.status] || STATUS_CONFIG.unread).label}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(activeMessage.createdAt)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeMessage.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sender Information Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeMessage.name}
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {activeMessage.email}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>

            {/* Full Message Body */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Message Content
              </h4>
              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {activeMessage.message}
              </div>
            </div>

            {/* Status Change Controls & Feedback */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Update Message Status:
                </span>
                {actionSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                    ✓ {actionSuccessMsg}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {["unread", "read", "replied", "archived"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeMessage.status === st
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteTarget(activeMessage)}
              >
                Delete Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveMessage(null)}
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Contact Message?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete the message from <strong>{deleteTarget.name}</strong> regarding <strong>"{deleteTarget.subject}"</strong>? This action cannot be undone.
              </p>
            </div>
            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
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
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
