import mongoose from "mongoose";
import dotenv from "dotenv";
import Article, { generateSlug } from "./models/Article.js";
import User from "./models/User.js";
import { cleanMetaText } from "../client/src/hooks/useDocumentMeta.js";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runSeoTests() {
  console.log("=================================================");
  console.log("DEVSTORY - SEO SLUGS & METADATA TEST SUITE");
  console.log("=================================================");

  // Connect to DB for direct model inspection & teardown
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devstory";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for SEO test fixtures.");

  const testSuffix = Date.now();
  let authorToken = "";
  let authorId = "";
  let readerToken = "";

  // 1. Setup author user
  const authorRes = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `SEO Author ${testSuffix}`,
      email: `seo.author.${testSuffix}@example.com`,
      password: "Password123!",
    }),
  });
  const authorData = await authorRes.json();
  assert(authorRes.status === 201, "Author created for SEO test suite");
  authorToken = authorData.token;
  authorId = authorData.user.id || authorData.user._id;

  // 2. Setup reader user
  const readerRes = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `SEO Reader ${testSuffix}`,
      email: `seo.reader.${testSuffix}@example.com`,
      password: "Password123!",
    }),
  });
  const readerData = await readerRes.json();
  assert(readerRes.status === 201, "Reader created for SEO test suite");
  readerToken = readerData.token;

  // --- Test 1: Unit Test Slug Generation Algorithm ---
  console.log("\n--- Test 1: Slug Generation Algorithm & Normalization ---");
  assert(
    generateSlug("Building Modern Web Apps in 2026!") === "building-modern-web-apps-in-2026",
    "generateSlug handles punctuation and exclamation marks"
  );
  assert(
    generateSlug("   React & Next.js vs Vite & Vue   ") === "react-and-nextjs-vs-vite-and-vue",
    "generateSlug handles & mapping and extra whitespace"
  );
  assert(
    generateSlug("Café & Crème Brûlée Architecture") === "cafe-and-creme-brulee-architecture",
    "generateSlug normalizes diacritics / accents (é, û, è)"
  );
  assert(
    generateSlug("___Special---Characters___#1?") === "special-characters-1",
    "generateSlug strips leading/trailing underscores and hyphens"
  );
  assert(
    generateSlug("") === "article",
    "generateSlug provides fallback for empty string"
  );
  assert(
    generateSlug("🚀✨🎉") === "article",
    "generateSlug provides fallback for pure emoji string"
  );

  // --- Test 2: Unit Test Clean Meta Text ---
  console.log("\n--- Test 2: SEO Meta Clean Text & Safety ---");
  assert(
    cleanMetaText("<p>Hello <strong>World</strong>!</p>", 160) === "Hello World!",
    "cleanMetaText removes HTML tags cleanly"
  );
  assert(
    cleanMetaText("   Lots   of   irregular    spaces   ", 160) === "Lots of irregular spaces",
    "cleanMetaText normalizes whitespace"
  );
  const longText = "A".repeat(200);
  assert(
    cleanMetaText(longText, 50).length <= 53 && cleanMetaText(longText, 50).endsWith("..."),
    "cleanMetaText truncates safely with ellipsis"
  );

  // --- Test 3: New Article Automatic Slug Generation ---
  console.log("\n--- Test 3: New Article Automatic Slug Generation ---");
  const title1 = `Full-Stack Architecture Patterns ${testSuffix}`;
  const postRes1 = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: title1,
      content: "<p>Comprehensive guide to full-stack architecture.</p>",
      category: "Architecture",
      tags: ["FullStack", "Architecture", "MongoDB"],
    }),
  });
  const postData1 = await postRes1.json();
  assert(postRes1.status === 201, "POST /api/articles returns 201");
  const expectedSlug1 = `full-stack-architecture-patterns-${testSuffix}`;
  assert(postData1.article.slug === expectedSlug1, `Article slug automatically generated: ${postData1.article.slug}`);

  // --- Test 4: Duplicate Titles & Collision Resolution ---
  console.log("\n--- Test 4: Duplicate Titles & Collision Resolution ---");
  const postRes2 = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: title1, // Duplicate title!
      content: "<p>Second article with identical title.</p>",
      category: "Architecture",
    }),
  });
  const postData2 = await postRes2.json();
  assert(postRes2.status === 201, "Second article with duplicate title created");
  const expectedSlug2 = `${expectedSlug1}-1`;
  assert(
    postData2.article.slug === expectedSlug2,
    `Collision resolved safely: got "${postData2.article.slug}", expected "${expectedSlug2}"`
  );

  // Third duplicate
  const postRes3 = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: title1, // Third duplicate!
      content: "<p>Third article with identical title.</p>",
      category: "Architecture",
    }),
  });
  const postData3 = await postRes3.json();
  const expectedSlug3 = `${expectedSlug1}-2`;
  assert(
    postData3.article.slug === expectedSlug3,
    `Third collision resolved safely: got "${postData3.article.slug}", expected "${expectedSlug3}"`
  );

  // --- Test 5: Existing Valid Slugs Preserved When Updating Other Fields ---
  console.log("\n--- Test 5: Existing Valid Slugs Preserved When Title Unchanged ---");
  const putRes1 = await fetch(`${API_BASE}/articles/${postData1.article.slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: title1, // Same title
      content: "<p>Updated content only!</p>",
      category: "Technology",
    }),
  });
  const putData1 = await putRes1.json();
  assert(putRes1.status === 200, "PUT /api/articles/:slug returns 200 OK");
  assert(
    putData1.article.slug === expectedSlug1,
    `Slug remained unchanged when title was identical (got "${putData1.article.slug}")`
  );

  // --- Test 6: Editing an Article Title Updates Slug Cleanly ---
  console.log("\n--- Test 6: Editing an Article Title Updates Slug Cleanly ---");
  const newTitle = `NextGen Cloud Infrastructure ${testSuffix}`;
  const putRes2 = await fetch(`${API_BASE}/articles/${postData1.article.slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: newTitle,
      content: "<p>Updated content and title!</p>",
    }),
  });
  const putData2 = await putRes2.json();
  assert(putRes2.status === 200, "PUT with new title returns 200 OK");
  const expectedNewSlug = `nextgen-cloud-infrastructure-${testSuffix}`;
  assert(
    putData2.article.slug === expectedNewSlug,
    `Slug updated to match new title: got "${putData2.article.slug}", expected "${expectedNewSlug}"`
  );

  // --- Test 7: Resolving by MongoDB ObjectId as Fallback ---
  console.log("\n--- Test 7: Resolving by MongoDB ObjectId Fallback ---");
  const getByIdRes = await fetch(`${API_BASE}/articles/${postData1.article._id}`);
  const getByIdData = await getByIdRes.json();
  assert(getByIdRes.status === 200, "GET by MongoDB ObjectId returns 200 OK");
  assert(
    getByIdData.article.slug === expectedNewSlug,
    "Article resolved by MongoDB ID contains current SEO slug for frontend canonicalization"
  );

  // --- Test 8: Resolving by Slug Directly (Browser Refresh / Direct Link) ---
  console.log("\n--- Test 8: Resolving by Slug Directly ---");
  const getBySlugRes = await fetch(`${API_BASE}/articles/${expectedNewSlug}`);
  const getBySlugData = await getBySlugRes.json();
  assert(getBySlugRes.status === 200, "GET by slug directly returns 200 OK");
  assert(getBySlugData.article.title === newTitle, "Article title matches");

  // --- Test 9: Invalid / Non-Existent Slug Returns 404 ---
  console.log("\n--- Test 9: Invalid / Non-Existent Slug Returns 404 ---");
  const notFoundRes = await fetch(`${API_BASE}/articles/non-existent-slug-xyz-${testSuffix}`);
  assert(notFoundRes.status === 404, "Non-existent slug returns 404 Not Found");

  // --- Test 10: Draft Article Security Preservation ---
  console.log("\n--- Test 10: Draft Article Security Preservation ---");
  const draftTitle = `Secret Draft Article ${testSuffix}`;
  const draftRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: draftTitle,
      content: "<p>Draft content not yet published.</p>",
      status: "draft",
    }),
  });
  const draftData = await draftRes.json();
  assert(draftRes.status === 201, "Draft article created with slug");
  const draftSlug = draftData.article.slug;

  // Public/unauthenticated access to draft slug
  const pubDraftRes = await fetch(`${API_BASE}/articles/${draftSlug}`);
  assert(pubDraftRes.status === 404, "Public access to draft slug returns 404");

  // Other authenticated reader access to draft slug
  const readerDraftRes = await fetch(`${API_BASE}/articles/${draftSlug}`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  assert(readerDraftRes.status === 404, "Unauthorized reader access to draft slug returns 404");

  // Author access to draft slug
  const authorDraftRes = await fetch(`${API_BASE}/articles/${draftSlug}`, {
    headers: { Authorization: `Bearer ${authorToken}` },
  });
  assert(authorDraftRes.status === 200, "Author access to own draft slug returns 200 OK");

  // --- Cleanup ---
  console.log("\n--- Cleaning up test fixtures ---");
  await Article.deleteMany({
    _id: { $in: [postData1.article._id, postData2.article._id, postData3.article._id, draftData.article._id] },
  });
  await mongoose.models.User.deleteMany({
    _id: { $in: [authorId, readerData.user.id || readerData.user._id] },
  });
  await mongoose.disconnect();
  console.log("Cleanup complete and disconnected from DB.");

  console.log("\n=================================================");
  console.log("🎉 ALL SEO SLUGS & METADATA TESTS PASSED (100%)");
  console.log("=================================================");
}

runSeoTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
