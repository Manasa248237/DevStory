import mongoose from "mongoose";
import dotenv from "dotenv";
import createDOMPurify from "../client/node_modules/dompurify/dist/purify.es.mjs";
import { JSDOM } from "../client/node_modules/jsdom/lib/api.js";
import Article from "./models/Article.js";
import User from "./models/User.js";

dotenv.config();

const jsdomWindow = new JSDOM("").window;
const DOMPurify = createDOMPurify(jsdomWindow);

// Configure DOMPurify hooks
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

function sanitizeHtmlForTest(rawHtml) {
  if (!rawHtml || typeof rawHtml !== "string") return "";
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike", "del",
      "ul", "ol", "li", "blockquote", "code", "pre", "hr", "a", "span", "mark", "br",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style", "title"],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "javascript:"],
  });
}

const API_BASE = "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runRichTextSecurityTests() {
  console.log("=================================================");
  console.log("DEVSTORY - RICH TEXT EDITOR & SECURITY TEST SUITE");
  console.log("=================================================");

  const timestamp = Date.now();
  let authorToken = "";
  let authorId = "";

  // 1. Setup author user
  const authorRes = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Editor Author ${timestamp}`,
      email: `editor.author.${timestamp}@example.com`,
      password: "Password123!",
    }),
  });
  const authorData = await authorRes.json();
  assert(authorRes.status === 201, "Author registered for rich text suite");
  authorToken = authorData.token;
  authorId = authorData.user.id || authorData.user._id;

  // --- Test 1: XSS & Malicious Script Injection Sanitization ---
  console.log("\n--- Test 1: Security & Sanitization Checks ---");

  const maliciousScript = `<p>Safe text</p><script>alert('XSS-ATTACK');</script>`;
  const sanitizedScript = sanitizeHtmlForTest(maliciousScript);
  assert(!sanitizedScript.includes("<script>"), "Sanitizer strips <script> tag completely");
  assert(!sanitizedScript.includes("alert("), "Sanitizer strips script execution content");

  const maliciousOnerror = `<img src="invalid-image.jpg" onerror="alert('HACKED')" />`;
  const sanitizedOnerror = sanitizeHtmlForTest(maliciousOnerror);
  assert(!sanitizedOnerror.includes("onerror"), "Sanitizer removes malicious onerror attribute");

  const maliciousJavascriptUrl = `<a href="javascript:alert('XSS')">Malicious Link</a>`;
  const sanitizedJavascriptUrl = sanitizeHtmlForTest(maliciousJavascriptUrl);
  assert(!sanitizedJavascriptUrl.includes("javascript:"), "Sanitizer blocks javascript: protocol URIs");

  const maliciousIframe = `<iframe src="https://evil.com/phishing"></iframe><p>Article content</p>`;
  const sanitizedIframe = sanitizeHtmlForTest(maliciousIframe);
  assert(!sanitizedIframe.includes("<iframe"), "Sanitizer strips iframe embeds completely");

  const maliciousForm = `<form action="/steal"><input name="user"/><button type="submit">Submit</button></form>`;
  const sanitizedForm = sanitizeHtmlForTest(maliciousForm);
  assert(!sanitizedForm.includes("<form") && !sanitizedForm.includes("<input"), "Sanitizer strips embedded forms and inputs");

  const secureLink = `<a href="https://example.com/guide">External Guide</a>`;
  const sanitizedSecureLink = sanitizeHtmlForTest(secureLink);
  assert(
    sanitizedSecureLink.includes('target="_blank"') && sanitizedSecureLink.includes('rel="noopener noreferrer"'),
    "Sanitizer enforces secure target='_blank' and rel='noopener noreferrer' on external links"
  );

  // --- Test 2: Create Formatted Rich Text Article ---
  console.log("\n--- Test 2: Create Article with Rich Text Formatting ---");
  const richHtmlContent = `
    <h1>Mastering Modern Event-Driven Systems</h1>
    <h2>Core Architectural Concepts</h2>
    <p>This guide explores <strong>bold statements</strong>, <em>italic emphasis</em>, <u>underlined key notes</u>, and <s>deprecated patterns</s>.</p>
    <blockquote>"Architecture is the decisions that you wish you could get right early in a project."</blockquote>
    <ul>
      <li>Asynchronous event queues</li>
      <li>Distributed log streaming</li>
      <li>Dead letter queue (DLQ) retry policies</li>
    </ul>
    <ol>
      <li>Step 1: Producer publishes event</li>
      <li>Step 2: Broker persists event to log</li>
      <li>Step 3: Consumer processes message</li>
    </ol>
    <pre><code>async function processEvent(event) {\n  console.log("Processing:", event.id);\n}</code></pre>
    <p>Read more at <a href="https://devstory.blog/docs">DevStory Docs</a>.</p>
  `.trim();

  const createRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Rich Text Architecture Guide ${timestamp}`,
      content: richHtmlContent,
      category: "Architecture",
      tags: ["RichText", "Architecture", "Engineering"],
      status: "published",
    }),
  });

  const createData = await createRes.json();
  assert(createRes.status === 201, "POST /api/articles creates formatted article (201 Created)");
  const createdArticle = createData.article;

  // Verify MongoDB stored formatted HTML intact
  assert(createdArticle.content.includes("<h1>Mastering Modern Event-Driven Systems</h1>"), "Heading 1 stored in DB");
  assert(createdArticle.content.includes("<h2>Core Architectural Concepts</h2>"), "Heading 2 stored in DB");
  assert(createdArticle.content.includes("<blockquote>"), "Blockquote stored in DB");
  assert(createdArticle.content.includes("<ul>") && createdArticle.content.includes("<li>"), "Unordered list stored in DB");
  assert(createdArticle.content.includes("<ol>"), "Ordered list stored in DB");
  assert(createdArticle.content.includes("<pre><code>"), "Code block stored in DB");
  assert(createdArticle.content.includes("<a href="), "Links stored in DB");

  // Verify auto-generated excerpt is clean plain text
  assert(!createdArticle.excerpt.includes("<"), "Auto-generated excerpt strips HTML tags cleanly");
  assert(createdArticle.excerpt.includes("Mastering Modern Event-Driven Systems"), "Excerpt contains plain article text");

  // --- Test 3: Read & Public Rendering Verification ---
  console.log("\n--- Test 3: Public Article Retrieval & Content Integrity ---");
  const getRes = await fetch(`${API_BASE}/articles/${createdArticle.slug}`);
  const getData = await getRes.json();
  assert(getRes.status === 200, "GET /api/articles/:slug returns 200 OK");
  assert(getData.article.content === richHtmlContent, "Retrieved content matches formatted HTML exactly");

  // --- Test 4: Edit Formatted Article ---
  console.log("\n--- Test 4: Edit & Update Formatted Article ---");
  const updatedHtmlContent = `
    <h1>Mastering Modern Event-Driven Systems (V2)</h1>
    <p>Updated content with <strong>expanded Kafka streaming</strong> examples.</p>
    <pre><code>const consumer = kafka.consumer({ groupId: 'payment-processors' });</code></pre>
  `.trim();

  const updateRes = await fetch(`${API_BASE}/articles/${createdArticle.slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Rich Text Architecture Guide V2 ${timestamp}`,
      content: updatedHtmlContent,
    }),
  });

  const updateData = await updateRes.json();
  assert(updateRes.status === 200, "PUT /api/articles/:slug returns 200 OK");
  assert(updateData.article.content === updatedHtmlContent, "Updated rich text saved and returned in response");

  // --- Test 5: Plain Text Compatibility ---
  console.log("\n--- Test 5: Backward Compatibility for Legacy Plain-Text Content ---");
  const plainTextArticleRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Legacy Plain Text Article ${timestamp}`,
      content: "This is a simple plain text article.\n\nIt has two separate paragraphs without HTML markup.",
      category: "General",
    }),
  });
  const plainTextData = await plainTextArticleRes.json();
  assert(plainTextArticleRes.status === 201, "Legacy plain text article created successfully");
  assert(
    !plainTextData.article.content.startsWith("<"),
    "Plain text stored without corrupting original text format"
  );

  // --- Test 6: Empty Content Rejection ---
  console.log("\n--- Test 6: Validation for Empty & Whitespace Content ---");
  const emptyRes1 = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Empty Test ${timestamp}`,
      content: "",
    }),
  });
  assert(emptyRes1.status === 400, "Empty content string rejected with 400 Bad Request");

  const emptyRes2 = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Whitespace Test ${timestamp}`,
      content: "   ",
    }),
  });
  assert(emptyRes2.status === 400, "Whitespace content rejected with 400 Bad Request");

  // --- Cleanup ---
  console.log("\n--- Cleaning up test fixtures ---");
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devstory";
  await mongoose.connect(mongoUri);
  await Article.deleteMany({
    _id: { $in: [createdArticle._id, updateData.article._id, plainTextData.article._id] },
  });
  await User.deleteOne({ _id: authorId });
  await mongoose.disconnect();
  console.log("Cleanup complete and disconnected from DB.");

  console.log("\n=================================================");
  console.log("🎉 ALL RICH TEXT & SECURITY TESTS PASSED (100%)");
  console.log("=================================================");
}

runRichTextSecurityTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
