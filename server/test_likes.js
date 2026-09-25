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
  console.log("❤️ DevStory Likes Backend API Test Suite");
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
    const password = "LikePassword123!";

    // Create Test Users: Author, User A, User B
    const authorEmail = `author_like_${timestamp}@devstory.local`;
    const userAEmail = `userA_like_${timestamp}@devstory.local`;
    const userBEmail = `userB_like_${timestamp}@devstory.local`;

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
      body: JSON.stringify({ name: "Liker User A", email: userAEmail, password }),
    });
    const userASignupData = await userASignupRes.json();
    const userAToken = userASignupData.token;

    // 3. Register User B
    const userBSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Liker User B", email: userBEmail, password }),
    });
    const userBSignupData = await userBSignupRes.json();
    const userBToken = userBSignupData.token;

    // 4. Create Published Test Article
    const articleRes = await fetch(`${BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: `Likes Test Article ${timestamp}`,
        content: "Testing article likes functionality in DevStory.",
        category: "Technology",
        status: "published",
      }),
    });
    const articleData = await articleRes.json();
    const articleId = articleData.article._id;
    const articleSlug = articleData.article.slug;

    // --- TEST 1: Unauthenticated Like Request ---
    console.log("\n--- Scenario 1: Unauthenticated Like Request ---");
    const unauthLikeRes = await fetch(`${BASE_URL}/articles/${articleId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    assert(
      unauthLikeRes.status === 401,
      `Unauthenticated like request returns 401 Unauthorized (got ${unauthLikeRes.status})`
    );

    // --- TEST 2: Invalid Article ID ---
    console.log("\n--- Scenario 2: Invalid Article ID ---");
    const invalidIdRes = await fetch(`${BASE_URL}/articles/non-existent-slug-12345/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(
      invalidIdRes.status === 404,
      `Invalid article ID/slug returns 404 Not Found (got ${invalidIdRes.status})`
    );

    // --- TEST 3: Missing Article (Valid ObjectId but non-existent) ---
    console.log("\n--- Scenario 3: Missing Article ---");
    const fakeObjectId = new mongoose.Types.ObjectId().toString();
    const missingArticleRes = await fetch(`${BASE_URL}/articles/${fakeObjectId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(
      missingArticleRes.status === 404,
      `Missing article ObjectId returns 404 Not Found (got ${missingArticleRes.status})`
    );

    // --- TEST 4: Initial Like Status Check ---
    console.log("\n--- Scenario 4: Initial GET /likes status check ---");
    const initialStatusRes = await fetch(`${BASE_URL}/articles/${articleId}/likes`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const initialStatusData = await initialStatusRes.json();
    assert(
      initialStatusRes.status === 200 &&
        initialStatusData.likesCount === 0 &&
        initialStatusData.isLiked === false,
      `Initial likes count is 0 and isLiked is false`
    );

    // --- TEST 5: Authenticated User A Likes Published Article ---
    console.log("\n--- Scenario 5: Authenticated User A Likes Published Article ---");
    const userALikeRes = await fetch(`${BASE_URL}/articles/${articleId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const userALikeData = await userALikeRes.json();
    assert(
      userALikeRes.status === 200 &&
        userALikeData.success === true &&
        userALikeData.isLiked === true &&
        userALikeData.likesCount === 1,
      `User A likes article successfully (likesCount: ${userALikeData.likesCount})`
    );

    // --- TEST 6: Duplicate Like Attempt (User A likes again) ---
    console.log("\n--- Scenario 6: User Tries to Like the Same Article Twice ---");
    const duplicateLikeRes = await fetch(`${BASE_URL}/articles/${articleId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const duplicateLikeData = await duplicateLikeRes.json();
    assert(
      duplicateLikeRes.status === 200 &&
        duplicateLikeData.success === true &&
        duplicateLikeData.isLiked === true &&
        duplicateLikeData.likesCount === 1,
      `Duplicate like is handled safely without throwing error or duplicating count (likesCount: ${duplicateLikeData.likesCount})`
    );

    // --- TEST 7: Two Different Users Like the Same Article ---
    console.log("\n--- Scenario 7: User B Likes the Same Article ---");
    const userBLikeRes = await fetch(`${BASE_URL}/articles/${articleSlug}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
    });
    const userBLikeData = await userBLikeRes.json();
    assert(
      userBLikeRes.status === 200 &&
        userBLikeData.success === true &&
        userBLikeData.isLiked === true &&
        userBLikeData.likesCount === 2,
      `User B likes article via slug (likesCount increased to 2)`
    );

    // --- TEST 8: Verify GET /likes status for both User A and User B ---
    console.log("\n--- Scenario 8: Verify Likes Status & Count ---");
    const statusForUserARes = await fetch(`${BASE_URL}/articles/${articleId}/likes`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const statusForUserA = await statusForUserARes.json();

    const statusForUserBRes = await fetch(`${BASE_URL}/articles/${articleId}/likes`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const statusForUserB = await statusForUserBRes.json();

    const statusForAnonRes = await fetch(`${BASE_URL}/articles/${articleId}/likes`);
    const statusForAnon = await statusForAnonRes.json();

    assert(
      statusForUserA.likesCount === 2 &&
        statusForUserA.isLiked === true &&
        statusForUserB.likesCount === 2 &&
        statusForUserB.isLiked === true &&
        statusForAnon.likesCount === 2 &&
        statusForAnon.isLiked === false,
      `GET /likes correctly reports count 2 and individual isLiked flags for User A, User B, and Anonymous`
    );

    // --- TEST 9: User Unlikes Article ---
    console.log("\n--- Scenario 9: User A Unlikes Article ---");
    const userAUnlikeRes = await fetch(`${BASE_URL}/articles/${articleId}/like`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const userAUnlikeData = await userAUnlikeRes.json();
    assert(
      userAUnlikeRes.status === 200 &&
        userAUnlikeData.success === true &&
        userAUnlikeData.isLiked === false &&
        userAUnlikeData.likesCount === 1,
      `User A unlikes article (likesCount reduced to 1)`
    );

    // --- TEST 10: Toggle endpoint verification ---
    console.log("\n--- Scenario 10: Toggle Endpoint Verification ---");
    // Toggle ON for User A
    const toggleOnRes = await fetch(`${BASE_URL}/articles/${articleId}/like/toggle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const toggleOnData = await toggleOnRes.json();

    // Toggle OFF for User A
    const toggleOffRes = await fetch(`${BASE_URL}/articles/${articleId}/like/toggle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    const toggleOffData = await toggleOffRes.json();

    assert(
      toggleOnData.isLiked === true &&
        toggleOnData.likesCount === 2 &&
        toggleOffData.isLiked === false &&
        toggleOffData.likesCount === 1,
      `Toggle endpoint toggles like status on/off seamlessly`
    );

    console.log("\n=================================================");
    console.log(`SUMMARY: ${passedTests} / ${totalTests} Likes Backend Tests Passed!`);
    console.log("=================================================");
  } catch (error) {
    console.error("Test execution error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
