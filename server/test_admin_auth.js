/**
 * Integration Test Suite: Admin Role and Authorization Verification
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";
const TEST_TIMESTAMP = Date.now();

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  DEVOSTORY: ADMIN ROLE & AUTHORIZATION INTEGRATION TESTS");
  console.log("=======================================================\n");

  // Connect to DB directly for admin promotion setup and verification
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI missing from environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log(" Connected to MongoDB Atlas for test assertions.\n");

  const normalEmail = `regular_user_${TEST_TIMESTAMP}@devstory.test`;
  const adminEmail = `admin_user_${TEST_TIMESTAMP}@devstory.test`;
  const password = "Password123!";

  let normalToken = "";
  let adminToken = "";
  let normalUserId = "";
  let adminUserId = "";

  try {
    // ---------------------------------------------------------
    // TEST 1: Unauthenticated request to /api/admin/*
    // ---------------------------------------------------------
    console.log("--- TEST 1: Unauthenticated request to Admin endpoints ---");
    const unauthRes = await fetch(`${BASE_URL}/admin/check-auth`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const unauthData = await unauthRes.json();

    assert(
      unauthRes.status === 401,
      `Unauthenticated /api/admin/check-auth returns 401 Unauthorized (received ${unauthRes.status})`
    );
    assert(
      unauthData.success === false,
      `Unauthenticated response has success: false`
    );

    const unauthDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    assert(
      unauthDashRes.status === 401,
      `Unauthenticated /api/admin/dashboard returns 401 Unauthorized (received ${unauthDashRes.status})`
    );

    // ---------------------------------------------------------
    // TEST 2: Register a Normal User & verify default role
    // ---------------------------------------------------------
    console.log("\n--- TEST 2: Normal User Registration & Role Verification ---");
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Regular User ${TEST_TIMESTAMP}`,
        email: normalEmail,
        password,
      }),
    });
    const signupData = await signupRes.json();

    assert(signupRes.status === 201, `Normal user signup returns 201 Created`);
    assert(signupData.success === true, `Signup response has success: true`);
    assert(
      signupData.user && signupData.user.role === "user",
      `New user default role is "user" (received: ${signupData.user?.role})`
    );
    assert(
      signupData.user && !signupData.user.password,
      `Password / hash is not exposed in signup response`
    );

    normalToken = signupData.token;
    normalUserId = signupData.user.id || signupData.user._id;

    // ---------------------------------------------------------
    // TEST 3: Normal User attempting to access /api/admin/* (403 Forbidden)
    // ---------------------------------------------------------
    console.log("\n--- TEST 3: Normal User Accessing Admin Endpoints (403 Forbidden) ---");
    const normalAdminRes = await fetch(`${BASE_URL}/admin/check-auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalToken}`,
      },
    });
    const normalAdminData = await normalAdminRes.json();

    assert(
      normalAdminRes.status === 403,
      `Normal authenticated user gets 403 Forbidden on /api/admin/check-auth (received ${normalAdminRes.status})`
    );
    assert(
      normalAdminData.success === false,
      `Response indicates success: false`
    );
    assert(
      normalAdminData.message.includes("Forbidden") || normalAdminData.message.includes("Administrative privileges"),
      `Response contains appropriate forbidden message ("${normalAdminData.message}")`
    );

    const normalDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalToken}`,
      },
    });
    assert(
      normalDashRes.status === 403,
      `Normal authenticated user gets 403 Forbidden on /api/admin/dashboard (received ${normalDashRes.status})`
    );

    // ---------------------------------------------------------
    // TEST 4: Register Admin User and Promote to 'admin'
    // ---------------------------------------------------------
    console.log("\n--- TEST 4: Create Admin User & Sign In ---");
    const adminSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Admin User ${TEST_TIMESTAMP}`,
        email: adminEmail,
        password,
      }),
    });
    const adminSignupData = await adminSignupRes.json();
    adminUserId = adminSignupData.user.id || adminSignupData.user._id;

    // Directly update role to admin in MongoDB Atlas
    await User.findByIdAndUpdate(adminUserId, { role: "admin" });

    // Sign in again to get fresh JWT token reflecting admin role
    const adminSigninRes = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password,
      }),
    });
    const adminSigninData = await adminSigninRes.json();

    assert(adminSigninRes.status === 200, `Admin signin returns 200 OK`);
    assert(
      adminSigninData.user && adminSigninData.user.role === "admin",
      `Admin user has role: "admin" (received: ${adminSigninData.user?.role})`
    );
    assert(
      adminSigninData.user && !adminSigninData.user.password,
      `Password / hash is not exposed in signin response`
    );

    adminToken = adminSigninData.token;

    // ---------------------------------------------------------
    // TEST 5: Authenticated Admin accessing /api/admin/* (200 OK)
    // ---------------------------------------------------------
    console.log("\n--- TEST 5: Authenticated Admin Accessing Admin Endpoints (200 OK) ---");
    const adminCheckRes = await fetch(`${BASE_URL}/admin/check-auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const adminCheckData = await adminCheckRes.json();

    assert(
      adminCheckRes.status === 200,
      `Admin user gets 200 OK on /api/admin/check-auth (received ${adminCheckRes.status})`
    );
    assert(
      adminCheckData.success === true,
      `Response has success: true`
    );
    assert(
      adminCheckData.user && adminCheckData.user.role === "admin",
      `Returned user object reflects role: "admin"`
    );

    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const adminDashData = await adminDashRes.json();

    assert(
      adminDashRes.status === 200,
      `Admin user gets 200 OK on /api/admin/dashboard (received ${adminDashRes.status})`
    );
    assert(
      adminDashData.success === true,
      `Dashboard endpoint returns success: true`
    );

    // ---------------------------------------------------------
    // TEST 6: Verify Newsletter subscribers endpoint admin protection
    // ---------------------------------------------------------
    console.log("\n--- TEST 6: Newsletter Subscribers Admin Route Check ---");
    const normalSubRes = await fetch(`${BASE_URL}/newsletter/subscribers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalToken}`,
      },
    });
    assert(
      normalSubRes.status === 403,
      `Normal user forbidden (403) from accessing /api/newsletter/subscribers (received ${normalSubRes.status})`
    );

    const adminSubRes = await fetch(`${BASE_URL}/newsletter/subscribers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert(
      adminSubRes.status === 200,
      `Admin user allowed (200) to access /api/newsletter/subscribers (received ${adminSubRes.status})`
    );

    // Clean up test users
    await User.deleteMany({ _id: { $in: [normalUserId, adminUserId] } });
    console.log("\n Cleaned up test user records from database.");

  } catch (err) {
    console.error("Test execution error:", err);
    testsFailed++;
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n=======================================================");
  console.log(`  RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log("=======================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests();
