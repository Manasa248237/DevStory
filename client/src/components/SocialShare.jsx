import React, { useState, useEffect } from "react";

/**
 * Reusable Social Share Component for DevStory
 * Supports Browser Web Share API (navigator.share), WhatsApp, LinkedIn, X (Twitter), Facebook, and Copy Link.
 * 
 * Variants:
 * - 'bar': Rich post-article showcase card with primary native share (when available), platform pills, and quick copy button.
 * - 'compact': Header action bar button with 1-click native share and interactive floating dropdown.
 */
export default function SocialShare({
  article,
  customUrl = "",
  variant = "bar",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(customUrl);

  // Synchronize dynamic article URL from browser location or article slug
  useEffect(() => {
    if (customUrl) {
      setCurrentUrl(customUrl);
    } else if (typeof window !== "undefined") {
      if (article?.slug || article?._id) {
        setCurrentUrl(`${window.location.origin}/articles/${article.slug || article._id}`);
      } else {
        setCurrentUrl(window.location.href);
      }
    }
  }, [article, customUrl]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".social-share-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isDropdownOpen]);

  const articleTitle = article?.title || "DevStory Engineering Article";
  const articleExcerpt = article?.excerpt || "Read this in-depth perspective on modern software engineering on DevStory.";
  const articleTags = Array.isArray(article?.tags) && article.tags.length > 0
    ? article.tags.map((t) => t.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean).join(",")
    : "DevStory,TechBlog,WebDev";

  // Share Intent URLs
  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `*${articleTitle}*\n${articleExcerpt}\n\n${currentUrl}`
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      articleTitle
    )}&url=${encodeURIComponent(currentUrl)}&hashtags=${encodeURIComponent(articleTags)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(articleTitle)}`,
  };

  const openShareWindow = (e, platform, url) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsDropdownOpen(false);

    const width = 620;
    const height = 580;
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
    const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

    window.open(
      url,
      `share-${platform}`,
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`
    );
  };

  const handleCopyLink = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!currentUrl) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback for non-secure context or older browser environments
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Failed to copy URL:", err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!canNativeShare) {
      setIsDropdownOpen((prev) => !prev);
      return;
    }

    const shareData = {
      title: articleTitle,
      text: articleExcerpt,
      url: currentUrl,
    };

    try {
      if (navigator.canShare && !navigator.canShare(shareData)) {
        await navigator.share({
          title: articleTitle,
          url: currentUrl,
        });
      } else {
        await navigator.share(shareData);
      }
      setIsDropdownOpen(false);
    } catch (err) {
      // 1. User dismissed/cancelled dialog -> do not display error
      if (err.name === "AbortError") {
        return;
      }
      // 2. Unexpected failure -> fallback to dropdown menu gracefully
      console.warn("Native Web Share failed, showing menu fallback:", err);
      setIsDropdownOpen(true);
    }
  };

  // -------------------------------------------------------------
  // VARIANT 1: COMPACT (Header Action Bar Button & Floating Dropdown)
  // -------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div className={`relative inline-flex items-center social-share-dropdown-container ${className}`}>
        {canNativeShare ? (
          /* Split Button for browsers supporting Web Share API */
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={handleNativeShare}
              aria-label="Share article via device apps"
              title="Share article via device apps"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 focus:outline-hidden active:scale-95 cursor-pointer font-medium"
            >
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
              aria-label="Open more sharing platforms"
              title="More sharing options"
              className="px-2 py-2 border-l border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        ) : (
          /* Standard Single Button triggering Dropdown */
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen((prev) => !prev);
            }}
            aria-label="Share this article"
            title="Share this article"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40 active:scale-95 cursor-pointer font-medium"
          >
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
        )}

        {/* Floating Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
              Share this story
            </div>

            {/* Native Share Option inside dropdown if supported */}
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </span>
                <span>Device Apps Menu</span>
              </button>
            )}

            {/* WhatsApp */}
            <a
              href={shareLinks.whatsapp}
              onClick={(e) => openShareWindow(e, "whatsapp", shareLinks.whatsapp)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.146-.532-1.859-.774-3.047-2.656-3.14-2.781-.093-.125-.754-.997-.754-1.905 0-.907.472-1.353.642-1.539.169-.187.371-.234.494-.234.123 0 .247.002.355.008.113.007.266-.042.416.318.155.372.531 1.295.578 1.389.046.094.077.204.015.328-.063.125-.094.203-.187.312-.093.11-.197.246-.281.33-.094.094-.192.196-.083.383.11.188.489.807 1.05 1.306.722.643 1.33.842 1.518.935.188.094.298.079.408-.047.11-.125.469-.547.594-.734.125-.187.25-.156.422-.094.172.062 1.094.516 1.281.609.188.094.312.141.359.219.047.078.047.453-.097.858z"/>
                </svg>
              </span>
              <span>WhatsApp</span>
            </a>

            {/* LinkedIn */}
            <a
              href={shareLinks.linkedin}
              onClick={(e) => openShareWindow(e, "linkedin", shareLinks.linkedin)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </span>
              <span>LinkedIn</span>
            </a>

            {/* X (Twitter) */}
            <a
              href={shareLinks.twitter}
              onClick={(e) => openShareWindow(e, "twitter", shareLinks.twitter)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <span className="w-6 h-6 rounded-lg bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </span>
              <span>X (Twitter)</span>
            </a>

            {/* Facebook */}
            <a
              href={shareLinks.facebook}
              onClick={(e) => openShareWindow(e, "facebook", shareLinks.facebook)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </span>
              <span>Facebook</span>
            </a>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <span>{copied ? "Copied Link!" : "Copy Link"}</span>
                </div>
                {copied && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Done</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 2: BAR / SHOWCASE CARD (Bottom of Article Detail Page)
  // -------------------------------------------------------------
  return (
    <section
      aria-label="Share this article"
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-xs ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title & Call to Action */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Spread the Knowledge
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Enjoyed this article? Share it with fellow engineers
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Help other developers discover practical perspectives on modern architecture and software engineering.
          </p>
        </div>

        {/* Action Buttons Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Native Share Button (when supported by browser) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              aria-label="Share article via device native share"
              title="Share story via your device's native apps"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-200 shadow-xs shadow-indigo-600/25 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share Story</span>
            </button>
          )}

          {/* WhatsApp */}
          <a
            href={shareLinks.whatsapp}
            onClick={(e) => openShareWindow(e, "whatsapp", shareLinks.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share story on WhatsApp"
            title="Share on WhatsApp"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-emerald-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.146-.532-1.859-.774-3.047-2.656-3.14-2.781-.093-.125-.754-.997-.754-1.905 0-.907.472-1.353.642-1.539.169-.187.371-.234.494-.234.123 0 .247.002.355.008.113.007.266-.042.416.318.155.372.531 1.295.578 1.389.046.094.077.204.015.328-.063.125-.094.203-.187.312-.093.11-.197.246-.281.33-.094.094-.192.196-.083.383.11.188.489.807 1.05 1.306.722.643 1.33.842 1.518.935.188.094.298.079.408-.047.11-.125.469-.547.594-.734.125-.187.25-.156.422-.094.172.062 1.094.516 1.281.609.188.094.312.141.359.219.047.078.047.453-.097.858z"/>
            </svg>
            <span>WhatsApp</span>
          </a>

          {/* LinkedIn */}
          <a
            href={shareLinks.linkedin}
            onClick={(e) => openShareWindow(e, "linkedin", shareLinks.linkedin)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share story on LinkedIn"
            title="Share on LinkedIn"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-blue-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
          </a>

          {/* X (Twitter) */}
          <a
            href={shareLinks.twitter}
            onClick={(e) => openShareWindow(e, "twitter", shareLinks.twitter)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share story on X (Twitter)"
            title="Share on X (Twitter)"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-slate-900 dark:fill-slate-100 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X (Twitter)</span>
          </a>

          {/* Facebook */}
          <a
            href={shareLinks.facebook}
            onClick={(e) => openShareWindow(e, "facebook", shareLinks.facebook)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share story on Facebook"
            title="Share on Facebook"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-indigo-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
            </svg>
            <span>Facebook</span>
          </a>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy article link to clipboard"
            title="Copy article link"
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer border ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20"
                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Copy Error Alert */}
      {copyError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Unable to access clipboard. Please copy URL directly from your browser's address bar.</span>
        </div>
      )}
    </section>
  );
}
