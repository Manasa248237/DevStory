import DOMPurify from "dompurify";

/**
 * Configure and sanitize HTML string with strict security rules
 * Blocks XSS, malicious script execution, inline event handlers, javascript: URLs, and unsafe tags.
 */
export function sanitizeArticleContent(rawHtml) {
  if (!rawHtml || typeof rawHtml !== "string") {
    return "";
  }

  // Configure DOMPurify hooks to enforce secure links
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      // Force secure target and rel for all external links
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "del",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "hr",
      "a",
      "span",
      "mark",
      "br",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "class",
      "style",
      "title",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "javascript:"],
  });

  return cleanHtml;
}
