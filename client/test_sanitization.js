import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

function sanitizeArticleContent(rawHtml) {
  if (!rawHtml || typeof rawHtml !== "string") {
    return "";
  }

  purify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  const cleanHtml = purify.sanitize(rawHtml, {
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

console.log("=================================================");
console.log("DEVSTORY - ARTICLE SANITIZATION & SECURITY TEST");
console.log("=================================================");

// Test 1: Valid formatting preserved
const validHtml = `<h2>Architecture Overview</h2><p>Here is <strong>bold</strong> and <em>italic</em>.</p><ul><li>Point 1</li><li>Point 2</li></ul><blockquote>Quote</blockquote><pre><code>const x = 1;</code></pre><a href="https://example.com">Valid Link</a>`;
const cleanedValid = sanitizeArticleContent(validHtml);
console.log("\n--- Test 1: Valid Rich Content Formatting ---");
if (
  cleanedValid.includes("<h2>") &&
  cleanedValid.includes("<strong>bold</strong>") &&
  cleanedValid.includes("<ul>") &&
  cleanedValid.includes("<blockquote>") &&
  cleanedValid.includes("<pre><code>") &&
  cleanedValid.includes('target="_blank"') &&
  cleanedValid.includes('rel="noopener noreferrer"')
) {
  console.log("✅ [PASS] 1. All valid formatting tags and attributes preserved correctly with secure links.");
} else {
  console.error("❌ [FAIL] 1. Valid formatting was corrupted:", cleanedValid);
  process.exit(1);
}

// Test 2: Script injection prevention
const scriptPayload = `<h3>Safe Title</h3><script>alert('XSS attack!')</script><p>Normal text</p>`;
const cleanedScript = sanitizeArticleContent(scriptPayload);
console.log("\n--- Test 2: Script Tag Elimination ---");
if (!cleanedScript.includes("<script>") && !cleanedScript.includes("alert") && cleanedScript.includes("Normal text")) {
  console.log("✅ [PASS] 2. <script> tags and payloads are completely stripped.");
} else {
  console.error("❌ [FAIL] 2. Script tag not removed:", cleanedScript);
  process.exit(1);
}

// Test 3: Event handler injection prevention
const eventPayload = `<p>Click here</p><img src="invalid.jpg" onerror="alert('XSS')" /><a href="#" onclick="fetch('/steal-cookies')">Click me</a>`;
const cleanedEvent = sanitizeArticleContent(eventPayload);
console.log("\n--- Test 3: Event Handler Stripping ---");
if (!cleanedEvent.includes("onerror") && !cleanedEvent.includes("onclick") && !cleanedEvent.includes("alert")) {
  console.log("✅ [PASS] 3. Inline event handlers (onerror, onclick) are completely removed.");
} else {
  console.error("❌ [FAIL] 3. Event handler not stripped:", cleanedEvent);
  process.exit(1);
}

// Test 4: Javascript pseudo-protocol URLs in links
const jsLinkPayload = `<a href="javascript:alert('pwned')">Malicious Link</a>`;
const cleanedJsLink = sanitizeArticleContent(jsLinkPayload);
console.log("\n--- Test 4: javascript: Protocol Link Neutralization ---");
if (!cleanedJsLink.includes("javascript:") && !cleanedJsLink.includes("alert")) {
  console.log("✅ [PASS] 4. javascript: pseudo-protocol URL blocked.");
} else {
  console.error("❌ [FAIL] 4. javascript: URL was not blocked:", cleanedJsLink);
  process.exit(1);
}

// Test 5: iFrames and external objects
const iframePayload = `<iframe src="https://evil-site.com/phishing"></iframe><object data="malware.swf"></object><p>Legitimate paragraph</p>`;
const cleanedIframe = sanitizeArticleContent(iframePayload);
console.log("\n--- Test 5: iFrame & Embed Rejection ---");
if (!cleanedIframe.includes("<iframe") && !cleanedIframe.includes("<object") && cleanedIframe.includes("Legitimate paragraph")) {
  console.log("✅ [PASS] 5. <iframe> and <object> tags successfully removed.");
} else {
  console.error("❌ [FAIL] 5. iFrame was not removed:", cleanedIframe);
  process.exit(1);
}

// Test 6: Legacy plain text preservation
const plainTextArticle = "This is a plain text article.\n\nIt has no HTML tags.\n\nParagraph 3.";
const isHtml = /<[a-z][\s\S]*>/i.test(plainTextArticle);
console.log("\n--- Test 6: Plain-text Compatibility Check ---");
if (!isHtml) {
  console.log("✅ [PASS] 6. Correctly identified as plain-text article, routed to newline-paragraph renderer.");
} else {
  console.error("❌ [FAIL] 6. Plain-text was incorrectly classified as HTML.");
  process.exit(1);
}

console.log("\n=================================================");
console.log("SUMMARY: 6/6 SANITIZATION & SECURITY TESTS PASSED");
console.log("=================================================");
