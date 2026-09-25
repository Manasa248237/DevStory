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
import { connectDB } from "./config/db.js";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=================================================");
  console.log("👤 DevStory User Profile Backend API Test Suite");
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
    const testEmail = `profile_tester_${timestamp}@devstory.local`;
    const testPassword = "OriginalPassword123";

    // --- TEST 1: Existing Sign Up Works ---
    console.log("\n--- Test 1: User Registration (Existing Auth) ---");
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Profile Original Name",
        email: testEmail,
        password: testPassword,
      }),
    });
    const signupData = await signupRes.json();
    assert(signupRes.status === 201, "Sign up returns 201 Created");
    assert(signupData.success === true, "Sign up response has success: true");
    assert(!!signupData.token, "Sign up response includes JWT token");
    const userToken = signupData.token;
    const userId = signupData.user.id;

    // --- TEST 2: Existing Sign In Works ---
    console.log("\n--- Test 2: User Sign In (Existing Auth) ---");
    const signinRes = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const signinData = await signinRes.json();
    assert(signinRes.status === 200, "Sign in returns 200 OK");
    assert(signinData.success === true, "Sign in returns success: true");
    assert(signinData.user.email === testEmail, "Sign in returns correct user data");

    // Seed 1 published article for this author to test articlesCount in profile
    const article = new Article({
      title: `Article by Profile Tester ${timestamp}`,
      content: "This is test content for article count in profile.",
      category: "General",
      status: "published",
      author: userId,
    });
    await article.save();

    // --- TEST 3: Retrieve Profile as Authenticated User ---
    console.log("\n--- Test 3: Retrieve Profile (Authenticated) ---");
    const getProfileRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const getProfileData = await getProfileRes.json();
    assert(getProfileRes.status === 200, "GET /api/users/profile returns 200 OK");
    assert(getProfileData.success === true, "GET profile has success: true");
    assert(getProfileData.user.name === "Profile Original Name", "User name is correct");
    assert(getProfileData.user.username === "Profile Original Name", "Username alias is provided");
    assert(getProfileData.user.email === testEmail, "Email is correct");
    assert(getProfileData.user.role === "user", "Role is 'user'");
    assert(getProfileData.user.articlesCount === 1, "articlesCount reflects published articles");
    assert(getProfileData.user.password === undefined, "Password hash is NOT exposed in response");

    // --- TEST 4: Unauthenticated Request Rejection ---
    console.log("\n--- Test 4: Unauthenticated Profile Access ---");
    const unauthRes = await fetch(`${BASE_URL}/users/profile`);
    const unauthData = await unauthRes.json();
    assert(unauthRes.status === 401, "GET /api/users/profile without token returns 401 Unauthorized");
    assert(unauthData.success === false, "Unauthenticated request returns success: false");

    // --- TEST 5: Update Permitted Fields (name, bio, avatar) ---
    console.log("\n--- Test 5: Update Permitted Profile Fields ---");
    const updateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: "Profile Updated Name",
        bio: "Senior Full Stack Software Architect passionate about React and Express.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, "PUT /api/users/profile returns 200 OK");
    assert(updateData.success === true, "Update returns success: true");
    assert(updateData.user.name === "Profile Updated Name", "Updated name persisted");
    assert(updateData.user.bio.includes("Senior Full Stack"), "Updated bio persisted");
    assert(updateData.user.avatar.includes("images.unsplash.com"), "Updated avatar persisted");
    assert(updateData.user.password === undefined, "Password hash is not exposed on update");

    // Verify persistence via subsequent GET
    const verifyGetRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const verifyGetData = await verifyGetRes.json();
    assert(verifyGetData.user.name === "Profile Updated Name", "Subsequent GET reflects updated name");
    assert(verifyGetData.user.bio.includes("Senior Full Stack"), "Subsequent GET reflects updated bio");

    // --- TEST 6: Invalid Input Validation ---
    console.log("\n--- Test 6: Input Validation Checks ---");
    // 6a. Name too short (< 2 chars)
    const shortNameRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name: "A" }),
    });
    assert(shortNameRes.status === 400, "Name under 2 chars returns 400 Bad Request");

    // 6b. Empty username / whitespace username
    const emptyNameRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name: "" }),
    });
    assert(emptyNameRes.status === 400, "Empty name returns 400 Bad Request");

    const whitespaceNameRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name: "     " }),
    });
    assert(whitespaceNameRes.status === 400, "Whitespace-only name returns 400 Bad Request");

    // 6c. Name over 50 chars
    const longNameRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name: "A".repeat(51) }),
    });
    assert(longNameRes.status === 400, "Name over 50 chars returns 400 Bad Request");

    // 6d. Bio too long (> 250 chars)
    const longBioRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ bio: "X".repeat(251) }),
    });
    assert(longBioRes.status === 400, "Bio over 250 chars returns 400 Bad Request");

    // 6e. Invalid avatar URL
    const invalidAvatarRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ avatar: "not-a-valid-http-url" }),
    });
    assert(invalidAvatarRes.status === 400, "Non-HTTP avatar returns 400 Bad Request");

    // 6f. Valid empty string to clear avatar
    const clearAvatarRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ avatar: "" }),
    });
    const clearAvatarData = await clearAvatarRes.json();
    assert(clearAvatarRes.status === 200, "Clearing avatar with empty string returns 200 OK");
    assert(clearAvatarData.user.avatar === "", "Avatar is cleared");

    // 6g. Unauthorized update attempt (missing token)
    const noTokenUpdateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauthorized Name" }),
    });
    assert(noTokenUpdateRes.status === 401, "PUT /api/users/profile without token returns 401 Unauthorized");

    // 6h. Unauthorized update attempt (invalid token)
    const invalidTokenUpdateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid_token_12345",
      },
      body: JSON.stringify({ name: "Unauthorized Name" }),
    });
    assert(invalidTokenUpdateRes.status === 401, "PUT /api/users/profile with invalid token returns 401 Unauthorized");

    // 6i. Duplicate username / non-conflicting username update
    const duplicateNameRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ username: "Alex Johnson" }),
    });
    assert(duplicateNameRes.status === 200, "Valid username update using username alias returns 200 OK");

    // --- TEST 7: Security - Role and Password Immutable via Profile Endpoint ---
    console.log("\n--- Test 7: Security Guarding (Role & Password Immutable) ---");
    const hackAttemptRes = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        role: "admin", // Malicious privilege escalation attempt
        password: "HackedNewPassword123", // Malicious password override attempt
        email: "hacked_email@fake.com",
        _id: new mongoose.Types.ObjectId(), // Attempted ID tampering
      }),
    });
    const hackData = await hackAttemptRes.json();
    assert(hackAttemptRes.status === 200, "Request completes without error");
    assert(hackData.user.role === "user", "Role remains 'user' (privilege escalation blocked)");
    assert(hackData.user.email === testEmail, "Email remains unchanged");
    assert(hackData.user.id.toString() === userId.toString(), "User ID cannot be tampered");

    // Verify original password is still intact and wasn't overwritten
    const verifyLoginWithOriginal = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    assert(verifyLoginWithOriginal.status === 200, "Original password still works for signin");

    // Verify malicious password fails
    const verifyLoginWithFake = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "HackedNewPassword123",
      }),
    });
    assert(verifyLoginWithFake.status === 401, "Attempted hacked password does NOT work");

    // --- TEST 8: Nonexistent User Handling (Deleted User with Valid JWT) ---
    console.log("\n--- Test 8: Nonexistent User Handling ---");
    // Delete user from DB
    await User.findByIdAndDelete(userId);
    const deletedUserGetRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    // authMiddleware protect checks User.findById() and returns 401 if user no longer exists
    assert(
      deletedUserGetRes.status === 401 || deletedUserGetRes.status === 404,
      "Deleted user associated with token returns 401/404"
    );

    // Clean up test article
    await Article.deleteMany({ author: userId });

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
