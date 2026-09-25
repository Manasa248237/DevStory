/**
 * DevStory — Comprehensive Article Management (CRUD) Test Suite
 * Tests all requirements from prompt Section 9:
 * 1. Create article with valid data
 * 2. Create article with missing required fields (expected 400)
 * 3. Read published articles (expected 200)
 * 4. Read individual published article by slug (expected 200, viewCount increments)
 * 5. Read draft article as public user (expected 404)
 * 6. Read draft article as author (expected 200)
 * 7. Read draft article as admin (expected 200)
 * 8. Read logged-in user's articles (/api/articles/my-articles)
 * 9. Update owned article (expected 200)
 * 10. Attempt to update another user's article (expected 403)
 * 11. Admin updates another user's article (expected 200)
 * 12. Attempt to update with empty title (expected 400)
 * 13. Attempt unauthorized deletion (expected 403)
 * 14. Author deletes own article (expected 200)
 * 15. Admin deletes an article (expected 200)
 * 16. Verify deleted article returns 404
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function runTestSuite() {
  const { connectDB } = await import("./config/db.js");
  await connectDB();

  console.log("=================================================");
  console.log("DEVSTORY - ARTICLE MANAGEMENT (CRUD) VERIFICATION");
  console.log("=================================================\n");

  const rand = Math.floor(10000 + Math.random() * 90000);
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  // Helper for requests
  const req = async (url, opts = {}) => {
    const res = await fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...opts.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  // 0. Setup Users: Author, Reader, Admin
  console.log("--- Setting up Test Users ---");
  const authorData = { name: `Author ${rand}`, email: `author_${rand}@test.com`, password: "Password123!" };
  const readerData = { name: `Reader ${rand}`, email: `reader_${rand}@test.com`, password: "Password123!" };
  const adminData = { name: `Admin ${rand}`, email: `admin_${rand}@test.com`, password: "Password123!" };

  const { data: authorAuth } = await req(`${BASE_URL}/auth/signup`, { method: "POST", body: JSON.stringify(authorData) });
  const { data: readerAuth } = await req(`${BASE_URL}/auth/signup`, { method: "POST", body: JSON.stringify(readerData) });
  const { data: adminAuth } = await req(`${BASE_URL}/auth/signup`, { method: "POST", body: JSON.stringify(adminData) });

  const authorToken = authorAuth.token;
  const readerToken = readerAuth.token;
  let adminToken = adminAuth.token;

  // Elevate admin user role directly in DB
  const { default: User } = await import("./models/User.js");
  await User.updateOne({ email: adminData.email }, { role: "admin" });
  // Refresh admin token with admin role
  const { data: adminLogin } = await req(`${BASE_URL}/auth/signin`, { method: "POST", body: JSON.stringify({ email: adminData.email, password: adminData.password }) });
  adminToken = adminLogin.token;

  console.log("Author, Reader, and Admin users registered successfully.\n");

  // TEST 1: Create article with valid data
  console.log("--- Test 1: Create Article with Valid Data ---");
  const articlePayload = {
    title: `Mastering Fullstack Architecture with React and Node ${rand}`,
    content: "Comprehensive deep dive into building modular, maintainable, scalable web apps.",
    category: "Architecture",
    tags: ["react", "nodejs", "express"],
    status: "published",
  };
  const t1 = await req(`${BASE_URL}/articles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authorToken}` },
    body: JSON.stringify(articlePayload),
  });
  assert(t1.status === 201 && t1.data.article?.slug, "1. Create article with valid data returns 201 Created and unique slug");
  const publishedSlug = t1.data.article?.slug;
  const publishedId = t1.data.article?._id;

  // TEST 2: Create article with missing required fields (expected 400)
  console.log("\n--- Test 2: Validation on Missing Fields ---");
  const t2a = await req(`${BASE_URL}/articles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authorToken}` },
    body: JSON.stringify({ content: "Missing title" }),
  });
  assert(t2a.status === 400, "2a. Create article with missing title returns 400 Bad Request");

  const t2b = await req(`${BASE_URL}/articles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authorToken}` },
    body: JSON.stringify({ title: "Valid Title", content: "" }),
  });
  assert(t2b.status === 400, "2b. Create article with empty content returns 400 Bad Request");

  // TEST 3: Read published articles (expected 200)
  console.log("\n--- Test 3: Read Published Articles ---");
  const t3 = await req(`${BASE_URL}/articles`);
  assert(t3.status === 200 && Array.isArray(t3.data.articles), "3. Read published articles returns 200 OK with array");

  // TEST 4: Read individual published article by slug (increments view count)
  console.log("\n--- Test 4: Read Article by Slug & View Tracking ---");
  const initialViews = t1.data.article.viewCount || 0;
  const t4 = await req(`${BASE_URL}/articles/${publishedSlug}`);
  assert(t4.status === 200 && t4.data.article?.slug === publishedSlug, "4a. Read published article by slug returns 200 OK");
  assert(t4.data.article?.viewCount === initialViews + 1, "4b. Reading published article increments viewCount atomically");

  // TEST 5: Create a draft article & verify public access is 404
  console.log("\n--- Test 5: Draft Article Privacy Control ---");
  const draftPayload = {
    title: `Unpublished Confidential Draft ${rand}`,
    content: "This is a secret upcoming roadmap not yet published to the public.",
    category: "Productivity",
    status: "draft",
  };
  const tDraftCreate = await req(`${BASE_URL}/articles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authorToken}` },
    body: JSON.stringify(draftPayload),
  });
  const draftSlug = tDraftCreate.data.article?.slug;
  const draftId = tDraftCreate.data.article?._id;

  const t5Public = await req(`${BASE_URL}/articles/${draftSlug}`);
  assert(t5Public.status === 404, "5. Public access to draft article returns 404 Not Found");

  // TEST 6: Read draft article as authenticated author
  console.log("\n--- Test 6: Author Draft Preview ---");
  const t6 = await req(`${BASE_URL}/articles/${draftSlug}`, {
    headers: { Authorization: `Bearer ${authorToken}` },
  });
  assert(t6.status === 200 && t6.data.article?.title === draftPayload.title, "6. Authenticated author can access own draft article (200 OK)");

  // TEST 7: Read draft article as authenticated admin
  console.log("\n--- Test 7: Admin Draft Preview ---");
  const t7 = await req(`${BASE_URL}/articles/${draftSlug}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(t7.status === 200 && t7.data.article?.title === draftPayload.title, "7. Authenticated admin can access any draft article (200 OK)");

  // TEST 8: Read logged-in user's articles (/api/articles/my-articles)
  console.log("\n--- Test 8: My Articles Listing ---");
  const t8 = await req(`${BASE_URL}/articles/my-articles`, {
    headers: { Authorization: `Bearer ${authorToken}` },
  });
  assert(t8.status === 200 && t8.data.articles?.some((a) => a.slug === draftSlug), "8. Author's /my-articles includes drafts and published articles");

  // TEST 9: Update owned article by author
  console.log("\n--- Test 9: Author Updates Own Article ---");
  const updatePayload = {
    title: `Mastering Fullstack Architecture with React and Node ${rand} (Updated Edition)`,
    category: "React",
  };
  const t9 = await req(`${BASE_URL}/articles/${publishedId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${authorToken}` },
    body: JSON.stringify(updatePayload),
  });
  assert(t9.status === 200 && t9.data.article?.title === updatePayload.title && t9.data.article?.category === "React", "9. Author successfully updates owned article (200 OK)");

  // TEST 10: Attempt to update another user's article (expected 403)
  console.log("\n--- Test 10: Unauthorized Update Rejection ---");
  const t10 = await req(`${BASE_URL}/articles/${publishedId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ title: "Hacked by Reader" }),
  });
  assert(t10.status === 403, "10. Other authenticated users cannot update non-owned articles (403 Forbidden)");

  // TEST 11: Admin updates another user's article (expected 200)
  console.log("\n--- Test 11: Admin Update Privileges ---");
  const t11 = await req(`${BASE_URL}/articles/${publishedId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ category: "Design" }),
  });
  assert(t11.status === 200 && t11.data.article?.category === "Design", "11. Admin can update any article via administrative override (200 OK)");

  // TEST 12: Attempt to update with empty title (expected 400)
  console.log("\n--- Test 12: Empty Field Update Validation ---");
  const t12 = await req(`${BASE_URL}/articles/${publishedId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${authorToken}` },
    body: JSON.stringify({ title: "   " }),
  });
  assert(t12.status === 400, "12. Updating with empty title is rejected with 400 Bad Request");

  // TEST 13: Attempt unauthorized deletion (expected 403)
  console.log("\n--- Test 13: Unauthorized Deletion Rejection ---");
  const t13 = await req(`${BASE_URL}/articles/${draftId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  assert(t13.status === 403, "13. Other users cannot delete non-owned articles (403 Forbidden)");

  // TEST 14: Author deletes own article (expected 200)
  console.log("\n--- Test 14: Author Deletes Own Article ---");
  const t14 = await req(`${BASE_URL}/articles/${draftId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authorToken}` },
  });
  assert(t14.status === 200 && t14.data.success === true, "14. Author can delete owned article (200 OK)");

  // TEST 15: Admin deletes an article (expected 200)
  console.log("\n--- Test 15: Admin Deletes Article ---");
  const t15 = await req(`${BASE_URL}/articles/${publishedId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(t15.status === 200 && t15.data.success === true, "15. Admin can delete any article via administrative override (200 OK)");

  // TEST 16: Verify deleted article returns 404
  console.log("\n--- Test 16: Verify Deleted Article ---");
  const t16 = await req(`${BASE_URL}/articles/${publishedId}`);
  assert(t16.status === 404, "16. Fetching deleted article returns 404 Not Found");

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================");

  process.exit(passed === total ? 0 : 1);
}

runTestSuite().catch((err) => {
  console.error("Test runner encountered an unhandled error:", err);
  process.exit(1);
});
