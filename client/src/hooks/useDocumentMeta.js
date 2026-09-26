import { useEffect } from "react";

export const DEFAULT_SITE_TITLE = "DevStory | Personal Tech Blog";
export const DEFAULT_SITE_DESCRIPTION =
  "A modern engineering journal exploring full-stack architecture, React patterns, Express REST APIs, and MongoDB Atlas database modeling.";
export const DEFAULT_META_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80";

/**
 * Safely strip HTML tags and decode basic whitespace from a string for use in meta tags
 */
export function cleanMetaText(input, maxLength = 160) {
  if (!input || typeof input !== "string") return "";
  const plainText = input
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return `${plainText.substring(0, maxLength).trim()}...`;
}

function setOrCreateMetaTag(attributeName, attributeValue, content) {
  if (typeof document === "undefined") return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content || "");
}

function setOrCreateLinkTag(rel, href) {
  if (typeof document === "undefined") return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute(rel, rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href || "");
}

/**
 * Updates browser document metadata, canonical links, OpenGraph, and Twitter card tags.
 */
export function updateDocumentMeta({
  title,
  description,
  url,
  image,
  type = "website",
  author,
  section,
  publishedTime,
  modifiedTime,
  tags = [],
}) {
  if (typeof document === "undefined") return;

  // Clean title
  const cleanTitle = cleanMetaText(title, 100);
  const fullTitle = cleanTitle
    ? cleanTitle.includes("DevStory")
      ? cleanTitle
      : `${cleanTitle} | DevStory`
    : DEFAULT_SITE_TITLE;

  // Clean description
  const cleanDesc = cleanMetaText(description, 200) || DEFAULT_SITE_DESCRIPTION;
  const fullImage = image || DEFAULT_META_IMAGE;
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  // Page Title
  document.title = fullTitle;

  // Standard SEO Description, Robots, and Canonical Link
  setOrCreateMetaTag("name", "description", cleanDesc);
  setOrCreateMetaTag("name", "robots", "index, follow");

  if (fullUrl) {
    setOrCreateLinkTag("canonical", fullUrl);
  }

  // Keywords (Derived safely from tags and category)
  const keywordList = [
    ...(Array.isArray(tags) ? tags.filter(Boolean) : []),
    section,
    "DevStory",
    "Tech Blog",
    "Web Development",
    "Engineering",
  ]
    .filter(Boolean)
    .join(", ");
  setOrCreateMetaTag("name", "keywords", keywordList);

  // Open Graph Metadata
  setOrCreateMetaTag("property", "og:site_name", "DevStory");
  setOrCreateMetaTag("property", "og:title", fullTitle);
  setOrCreateMetaTag("property", "og:description", cleanDesc);
  setOrCreateMetaTag("property", "og:url", fullUrl);
  setOrCreateMetaTag("property", "og:image", fullImage);
  setOrCreateMetaTag("property", "og:type", type);

  // Twitter / X Card Metadata
  setOrCreateMetaTag("name", "twitter:card", "summary_large_image");
  setOrCreateMetaTag("name", "twitter:title", fullTitle);
  setOrCreateMetaTag("name", "twitter:description", cleanDesc);
  setOrCreateMetaTag("name", "twitter:image", fullImage);
  if (fullUrl) {
    setOrCreateMetaTag("name", "twitter:url", fullUrl);
  }

  // Article Specific Open Graph tags
  if (type === "article") {
    if (author) {
      const authorName = typeof author === "object" ? author.name : author;
      setOrCreateMetaTag("property", "article:author", cleanMetaText(authorName, 50) || "DevStory Author");
      setOrCreateMetaTag("name", "author", cleanMetaText(authorName, 50) || "DevStory Author");
    }
    if (section) {
      setOrCreateMetaTag("property", "article:section", cleanMetaText(section, 50));
    }
    if (publishedTime) {
      const pubDate = new Date(publishedTime).toISOString();
      setOrCreateMetaTag("property", "article:published_time", pubDate);
    }
    if (modifiedTime) {
      const modDate = new Date(modifiedTime).toISOString();
      setOrCreateMetaTag("property", "article:modified_time", modDate);
    }
    if (Array.isArray(tags) && tags.length > 0) {
      setOrCreateMetaTag("property", "article:tag", tags.filter(Boolean).join(", "));
    }
  }
}

/**
 * Custom React Hook for declarative page and article metadata updates.
 */
export default function useDocumentMeta(metaConfig) {
  useEffect(() => {
    if (metaConfig) {
      updateDocumentMeta(metaConfig);
    }
  }, [
    metaConfig?.title,
    metaConfig?.description,
    metaConfig?.url,
    metaConfig?.image,
    metaConfig?.type,
    metaConfig?.author,
    metaConfig?.section,
    metaConfig?.publishedTime,
    metaConfig?.modifiedTime,
    JSON.stringify(metaConfig?.tags || []),
  ]);
}
