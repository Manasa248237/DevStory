/**
 * Generate platform-specific share URLs dynamically from the article title, excerpt, tags, and URL
 */
export function generateShareLinks(article, currentUrl = "") {
  const articleTitle = article?.title || "DevStory Article";
  const articleExcerpt = article?.excerpt || "";
  const cleanExcerpt = articleExcerpt ? articleExcerpt.slice(0, 120) : "";

  const articleTags = Array.isArray(article?.tags) && article.tags.length > 0
    ? article.tags.map((t) => t.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean).join(",")
    : "DevStory,TechBlog";

  const encodedUrl = encodeURIComponent(currentUrl || "");
  const encodedTitle = encodeURIComponent(articleTitle);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `*${articleTitle}*\n${cleanExcerpt ? cleanExcerpt + "\n\n" : ""}${currentUrl}`
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodeURIComponent(articleTags)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodeURIComponent(articleTags)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };
}

/**
 * Robust clipboard helper with fallback for non-secure / legacy browser contexts
 */
export async function copyToClipboard(text) {
  if (!text) throw new Error("No text to copy");

  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // If clipboard API throws permission error, fall through to fallback
    }
  }

  if (typeof document !== "undefined") {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    if (successful) return true;
  }

  throw new Error("Clipboard API unavailable");
}
