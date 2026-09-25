import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

import User from "./models/User.js";
import Article from "./models/Article.js";
import Comment from "./models/Comment.js";
import { connectDB } from "./config/db.js";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000/api";

async function runTests() {
  console.log("=================================================");
  console.log("💬 DevStory Comments Backend API Test Suite");
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

    // 1. Create Test Users: Article Author, Commenter User A, Commenter User B, Admin
    const authorEmail = `author_comment_${timestamp}@devstory.local`;
    const userAEmail = `userA_comment_${timestamp}@devstory.local`;
    const userBEmail = `userB_comment_${timestamp}@devstory.local`;
    const password = "CommentPassword123!";

    // Register Author
    const authorSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Article Author", email: authorEmail, password }),
    });
    const authorSignupData = await authorSignupRes.json();
    const authorToken = authorSignupData.token;
    const authorId = authorSignupData.user.id;

    // Register User A
    const userASignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Commenter User A", email: userAEmail, password }),
    });
    const userASignupData = await userASignupRes.json();
    const userAToken = userASignupData.token;
    const userAId = userASignupData.user.id;

    // Register User B
    const userBSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Commenter User B", email: userBEmail, password }),
    });
    const userBSignupData = await userBSignupRes.json();
    const userBToken = userBSignupData.token;
    const userBId = userBSignupData.user.id;

    // Create Test Article
    const articleRes = await fetch(`${BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: `Comment Test Article ${timestamp}`,
        content: "Detailed technical content for testing comments.",
        category: "Technology",
        status: "published",
      }),
    });
    const articleData = await articleRes.json();
    const articleId = articleData.article._id;
    const articleSlug = articleData.article.slug;

    // --- TEST 1: Unauthenticated Comment Creation Rejection ---
    console.log("\n--- Test 1: Unauthenticated Comment Creation ---");
    const unauthCreateRes = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Unauthenticated comment attempt." }),
    });
    assert(unauthCreateRes.status === 401, "POST comment without token returns 401 Unauthorized");

    // --- TEST 2: Missing or Empty Content Rejection ---
    console.log("\n--- Test 2: Input Validation (Empty / Missing Content) ---");
    const emptyContentRes = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ content: "" }),
    });
    assert(emptyContentRes.status === 400, "POST comment with empty string returns 400 Bad Request");

    const whitespaceContentRes = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ content: "     " }),
    });
    assert(whitespaceContentRes.status === 400, "POST comment with whitespace-only returns 400 Bad Request");

    const longContentRes = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ content: "C".repeat(1001) }),
    });
    assert(longContentRes.status === 400, "POST comment over 1000 chars returns 400 Bad Request");

    // --- TEST 3: Non-Existent & Invalid Article Testing ---
    console.log("\n--- Test 3: Invalid & Missing Article ID Handling ---");
    const nonExistentArticleId = new mongoose.Types.ObjectId();
    const missingArticleRes = await fetch(`${BASE_URL}/articles/${nonExistentArticleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ content: "Valid comment on missing article." }),
    });
    assert(missingArticleRes.status === 404, "POST comment on missing article returns 404 Not Found");

    // --- TEST 4: Valid Comment Creation (User A) ---
    console.log("\n--- Test 4: Valid Comment Creation ---");
    const validCreateRes = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ content: "Great article! Thanks for sharing this perspective." }),
    });
    const validCreateData = await validCreateRes.json();
    assert(validCreateRes.status === 201, "POST comment returns 201 Created");
    assert(validCreateData.success === true, "Creation response has success: true");
    assert(validCreateData.comment.content === "Great article! Thanks for sharing this perspective.", "Comment content saved correctly");
    assert(validCreateData.comment.user.name === "Commenter User A", "Author populated with user name");
    assert(validCreateData.comment.user.password === undefined, "Password omitted from populated user");
    const comment1Id = validCreateData.comment._id;

    // Create second comment by User B using Article SLUG
    const validCreate2Res = await fetch(`${BASE_URL}/articles/${articleSlug}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ content: "Awesome read! I have a question about performance." }),
    });
    const validCreate2Data = await validCreate2Res.json();
    assert(validCreate2Res.status === 201, "POST comment using article slug returns 201 Created");
    const comment2Id = validCreate2Data.comment._id;

    // --- TEST 5: Reading Comments for Article ---
    console.log("\n--- Test 5: Reading Comments ---");
    const getCommentsRes = await fetch(`${BASE_URL}/articles/${articleId}/comments`);
    const getCommentsData = await getCommentsRes.json();
    assert(getCommentsRes.status === 200, "GET /articles/:articleId/comments returns 200 OK");
    assert(getCommentsData.success === true, "Response has success: true");
    assert(getCommentsData.count === 2, "Returned count matches total comments (2)");
    assert(getCommentsData.comments[0]._id === comment2Id, "Comments are sorted newest first");

    // Also test GET via slug
    const getCommentsSlugRes = await fetch(`${BASE_URL}/comments/article/${articleSlug}`);
    const getCommentsSlugData = await getCommentsSlugRes.json();
    assert(getCommentsSlugRes.status === 200, "GET /comments/article/:slug returns 200 OK");
    assert(getCommentsSlugData.count === 2, "Slug retrieval returns all 2 comments");

    // --- TEST 6: Editing Owned Comment ---
    console.log("\n--- Test 6: Edit Owned Comment ---");
    const editOwnedRes = await fetch(`${BASE_URL}/comments/${comment1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ content: "Great article! (Updated after review)" }),
    });
    const editOwnedData = await editOwnedRes.json();
    assert(editOwnedRes.status === 200, "PUT comment by owner returns 200 OK");
    assert(editOwnedData.comment.content === "Great article! (Updated after review)", "Updated content persisted");

    // --- TEST 7: Editing Another User's Comment (Forbidden) ---
    console.log("\n--- Test 7: Unauthorized Edit Rejection ---");
    const editOtherRes = await fetch(`${BASE_URL}/comments/${comment1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ content: "Hacked content attempt by User B." }),
    });
    assert(editOtherRes.status === 403, "PUT comment owned by User A by User B returns 403 Forbidden");

    // --- TEST 8: Deleting Another User's Comment (Forbidden) ---
    console.log("\n--- Test 8: Unauthorized Delete Rejection ---");
    const deleteOtherRes = await fetch(`${BASE_URL}/comments/${comment1Id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userBToken}`,
      },
    });
    assert(deleteOtherRes.status === 403, "DELETE comment owned by User A by User B returns 403 Forbidden");

    // --- TEST 9: Article Author Deleting Comment on Their Article ---
    console.log("\n--- Test 9: Article Author Deletes Comment on Their Article ---");
    const deleteByArticleAuthorRes = await fetch(`${BASE_URL}/comments/${comment2Id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authorToken}`,
      },
    });
    assert(deleteByArticleAuthorRes.status === 200, "Article author can delete comments on their article (200 OK)");

    // --- TEST 10: Deleting Owned Comment ---
    console.log("\n--- Test 10: Delete Owned Comment ---");
    const deleteOwnedRes = await fetch(`${BASE_URL}/comments/${comment1Id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(deleteOwnedRes.status === 200, "Comment owner can delete their own comment (200 OK)");

    // --- TEST 11: Invalid Comment ID Format ---
    console.log("\n--- Test 11: Invalid Comment ID Format ---");
    const invalidCommentIdRes = await fetch(`${BASE_URL}/comments/not-a-valid-object-id`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(invalidCommentIdRes.status === 400, "Invalid comment ID returns 400 Bad Request");

    // Clean up test data
    await Article.findByIdAndDelete(articleId);
    await User.findByIdAndDelete(authorId);
    await User.findByIdAndDelete(userAId);
    await User.findByIdAndDelete(userBId);
    await Comment.deleteMany({ article: articleId });

    console.log("\n=================================================");
    console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log("=================================================");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
