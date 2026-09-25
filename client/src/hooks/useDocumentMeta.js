import { useEffect } from "react";

const DEFAULT_TITLE = "DevStory | Personal Tech Blog";
const DEFAULT_DESCRIPTION =
  "A modern engineering journal exploring full-stack architecture, React patterns, Express REST APIs, and MongoDB Atlas database modeling.";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80";

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
    element.setAttribute("rel", rel);
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
  publishedTime,
  tags,
}) {
  if (typeof document === "undefined") return;

  const fullTitle = title
    ? title.includes("DevStory")
      ? title
      : `${title} | DevStory`
    : DEFAULT_TITLE;

  const fullDesc = description || DEFAULT_DESCRIPTION;
  const fullImage = image || DEFAULT_IMAGE;
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  // Page Title
  document.title = fullTitle;

  // Standard SEO Description & Canonical Link
  setOrCreateMetaTag("name", "description", fullDesc);
  if (fullUrl) {
    setOrCreateLinkTag("canonical", fullUrl);
  }

  // Open Graph Metadata
  setOrCreateMetaTag("property", "og:site_name", "DevStory");
  setOrCreateMetaTag("property", "og:title", fullTitle);
  setOrCreateMetaTag("property", "og:description", fullDesc);
  setOrCreateMetaTag("property", "og:url", fullUrl);
  setOrCreateMetaTag("property", "og:image", fullImage);
  setOrCreateMetaTag("property", "og:type", type);

  // Twitter / X Card Metadata
  setOrCreateMetaTag("name", "twitter:card", "summary_large_image");
  setOrCreateMetaTag("name", "twitter:title", fullTitle);
  setOrCreateMetaTag("name", "twitter:description", fullDesc);
  setOrCreateMetaTag("name", "twitter:image", fullImage);
  if (fullUrl) {
    setOrCreateMetaTag("name", "twitter:url", fullUrl);
  }

  // Article Specific Open Graph tags
  if (type === "article") {
    if (author) setOrCreateMetaTag("property", "article:author", author);
    if (publishedTime) setOrCreateMetaTag("property", "article:published_time", publishedTime);
    if (Array.isArray(tags) && tags.length > 0) {
      setOrCreateMetaTag("property", "article:tag", tags.join(", "));
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
    metaConfig?.publishedTime,
  ]);
}
