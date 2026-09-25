import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

import { connectDB } from "./config/db.js";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000/api";

async function runTests() {
  console.log("=================================================");
  console.log("🔖 DevStory Bookmarks Backend API Test Suite");
  console.log("=================================================");

  try {
    await connectDB();

    let passedTests = 0;
    let totalTests = 0;

    const assert = (condition, description) => {
      totalTests++;
      if (condition) {
        console.log(`  ✓ [PASS] ${description}`);
        passedTests++;
      } else {
        console.error(`  ✗ [FAIL] ${description}`);
      }
    };

    const timestamp = Date.now();
    const password = "BookmarkPassword123!";

    // Create Test Users: Author, User A, User B
    const authorEmail = `author_bookmark_${timestamp}@devstory.local`;
    const userAEmail = `userA_bookmark_${timestamp}@devstory.local`;
    const userBEmail = `userB_bookmark_${timestamp}@devstory.local`;

    // 1. Register Author
    const authorSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Author User", email: authorEmail, password }),
    });
    const authorSignupData = await authorSignupRes.json();
    const authorToken = authorSignupData.token;

    // 2. Register User A
    const userASignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bookmark User A", email: userAEmail, password }),
    });
    const userASignupData = await userASignupRes.json();
    const userAToken = userASignupData.token;

    // 3. Register User B
    const userBSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bookmark User B", email: userBEmail, password }),
    });
    const userBSignupData = await userBSignupRes.json();
    const userBToken = userBSignupData.token;

    // 4. Create Published Test Articles (Article 1 and Article 2)
    const article1Res = await fetch(`${BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: `Bookmark Test Article 1 ${timestamp}`,
        content: "Content for bookmark test article 1.",
        category: "Technology",
        status: "published",
      }),
    });
    const article1Data = await article1Res.json();
    const article1Id = article1Data.article._id;
    const article1Slug = article1Data.article.slug;

    const article2Res = await fetch(`${BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: `Bookmark Test Article 2 ${timestamp}`,
        content: "Content for bookmark test article 2.",
        category: "Design",
        status: "published",
      }),
    });
    const article2Data = await article2Res.json();
    const article2Id = article2Data.article._id;

    // --- SCENARIO 1: Empty Bookmarks List ---
    console.log("\n--- Scenario 1: Empty Bookmarks List ---");
    const emptyBookmarksRes = await fetch(`${BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const emptyBookmarksData = await emptyBookmarksRes.json();
    assert(
      emptyBookmarksRes.status === 200 &&
        emptyBookmarksData.success === true &&
        emptyBookmarksData.count === 0 &&
        Array.isArray(emptyBookmarksData.bookmarks) &&
        emptyBookmarksData.bookmarks.length === 0,
      `GET /api/bookmarks for new user returns empty array with count 0`
    );

    // --- SCENARIO 2: Unauthenticated Requests ---
    console.log("\n--- Scenario 2: Unauthenticated Requests ---");
    const unauthPostRes = await fetch(`${BASE_URL}/articles/${article1Id}/bookmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const unauthGetRes = await fetch(`${BASE_URL}/bookmarks`);
    assert(
      unauthPostRes.status === 401 && unauthGetRes.status === 401,
      `Unauthenticated POST /bookmark and GET /bookmarks return 401 Unauthorized`
    );

    // --- SCENARIO 3: Invalid Article ID / Slug ---
    console.log("\n--- Scenario 3: Invalid Article ID ---");
    const invalidIdRes = await fetch(`${BASE_URL}/articles/invalid-slug-12345/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(
      invalidIdRes.status === 404,
      `Invalid article ID/slug returns 404 Not Found`
    );

    // --- SCENARIO 4: Missing Article (Non-existent ObjectId) ---
    console.log("\n--- Scenario 4: Missing Article ---");
    const fakeObjectId = new mongoose.Types.ObjectId().toString();
    const missingArticleRes = await fetch(`${BASE_URL}/articles/${fakeObjectId}/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(
      missingArticleRes.status === 404,
      `Missing article ObjectId returns 404 Not Found`
    );

    // --- SCENARIO 5: Create Bookmark for Article 1 (User A) ---
    console.log("\n--- Scenario 5: Create Bookmark (User A) ---");
    const userABookmarkRes = await fetch(`${BASE_URL}/articles/${article1Id}/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const userABookmarkData = await userABookmarkRes.json();
    assert(
      userABookmarkRes.status === 200 &&
        userABookmarkData.success === true &&
        userABookmarkData.isBookmarked === true,
      `User A bookmarks Article 1 successfully`
    );

    // --- SCENARIO 6: Save the Same Article Twice (Duplicate Prevention) ---
    console.log("\n--- Scenario 6: Save the Same Article Twice ---");
    const duplicateBookmarkRes = await fetch(`${BASE_URL}/articles/${article1Id}/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const duplicateBookmarkData = await duplicateBookmarkRes.json();
    assert(
      duplicateBookmarkRes.status === 200 &&
        duplicateBookmarkData.success === true &&
        duplicateBookmarkData.isBookmarked === true,
      `Duplicate bookmark is handled safely without throwing error`
    );

    // --- SCENARIO 7: Bookmark Status Endpoint Check ---
    console.log("\n--- Scenario 7: Bookmark Status Check ---");
    const statusRes = await fetch(`${BASE_URL}/articles/${article1Id}/bookmark-status`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const statusData = await statusRes.json();
    assert(
      statusRes.status === 200 && statusData.isBookmarked === true,
      `GET /bookmark-status correctly returns isBookmarked: true`
    );

    // --- SCENARIO 8: User B Bookmarks Article 2 ---
    console.log("\n--- Scenario 8: User B Bookmarks Article 2 ---");
    const userBBookmarkRes = await fetch(`${BASE_URL}/articles/${article2Id}/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
    });
    const userBBookmarkData = await userBBookmarkRes.json();
    assert(
      userBBookmarkRes.status === 200 && userBBookmarkData.isBookmarked === true,
      `User B bookmarks Article 2 successfully`
    );

    // --- SCENARIO 9: Privacy Check - Users Cannot Access Another User's Bookmarks ---
    console.log("\n--- Scenario 9: Privacy Check ---");
    const userABookmarksRes = await fetch(`${BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const userABookmarksData = await userABookmarksRes.json();

    const userBBookmarksRes = await fetch(`${BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const userBBookmarksData = await userBBookmarksRes.json();

    const userAHasArticle2 = userABookmarksData.bookmarks.some(
      (b) => String(b.article?._id) === String(article2Id)
    );
    const userBHasArticle1 = userBBookmarksData.bookmarks.some(
      (b) => String(b.article?._id) === String(article1Id)
    );

    assert(
      userABookmarksData.count === 1 &&
        userBBookmarksData.count === 1 &&
        !userAHasArticle2 &&
        !userBHasArticle1,
      `User A and User B only see their own respective bookmarks (privacy enforced)`
    );

    // --- SCENARIO 10: Database Consistency & Population ---
    console.log("\n--- Scenario 10: Database Consistency & Article Population ---");
    const populatedBookmark = userABookmarksData.bookmarks[0];
    assert(
      populatedBookmark.article &&
        populatedBookmark.article.title === `Bookmark Test Article 1 ${timestamp}` &&
        populatedBookmark.article.author &&
        populatedBookmark.article.author.name === "Author User",
      `Retrieved bookmark contains fully populated article and author object`
    );

    // --- SCENARIO 11: Remove Bookmark (User A unbookmarks Article 1) ---
    console.log("\n--- Scenario 11: Remove Bookmark ---");
    const removeBookmarkRes = await fetch(`${BASE_URL}/articles/${article1Slug}/bookmark`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const removeBookmarkData = await removeBookmarkRes.json();
    assert(
      removeBookmarkRes.status === 200 &&
        removeBookmarkData.success === true &&
        removeBookmarkData.isBookmarked === false,
      `User A removes bookmark via slug successfully`
    );

    // Verify list is now empty again for User A
    const postRemoveListRes = await fetch(`${BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const postRemoveListData = await postRemoveListRes.json();
    assert(
      postRemoveListData.count === 0,
      `User A bookmarks list count is 0 after removing bookmark`
    );

    // --- SCENARIO 12: Toggle Endpoint Check ---
    console.log("\n--- Scenario 12: Toggle Endpoint Check ---");
    const toggleOnRes = await fetch(`${BASE_URL}/articles/${article1Id}/bookmark/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const toggleOnData = await toggleOnRes.json();

    const toggleOffRes = await fetch(`${BASE_URL}/articles/${article1Id}/bookmark/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const toggleOffData = await toggleOffRes.json();

    assert(
      toggleOnData.isBookmarked === true && toggleOffData.isBookmarked === false,
      `Toggle bookmark endpoint toggles status on and off seamlessly`
    );

    console.log("\n=================================================");
    console.log(`SUMMARY: ${passedTests} / ${totalTests} Bookmarks Backend Tests Passed!`);
    console.log("=================================================");
  } catch (error) {
    console.error("Test execution error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
