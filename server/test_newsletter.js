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
  console.log("📧 DevStory Newsletter Backend API Test Suite");
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
    const testEmail = `subscriber_${timestamp}@devstory.local`;

    // --- TEST 1: Missing Email Validation ---
    console.log("\n--- Scenario 1: Missing Email Validation ---");
    const missingEmailRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const missingEmailData = await missingEmailRes.json();
    assert(
      missingEmailRes.status === 400 && missingEmailData.success === false,
      `Subscribe request without email returns 400 Bad Request`
    );

    // --- TEST 2: Invalid Email Format Validation ---
    console.log("\n--- Scenario 2: Invalid Email Format Validation ---");
    const invalidEmailRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-address-format" }),
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert(
      invalidEmailRes.status === 400 && invalidEmailData.success === false,
      `Subscribe request with malformed email returns 400 Bad Request`
    );

    // --- TEST 3: Valid New Subscription ---
    console.log("\n--- Scenario 3: Valid New Subscription ---");
    const validSubRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, source: "test_suite" }),
    });
    const validSubData = await validSubRes.json();
    assert(
      validSubRes.status === 201 &&
        validSubData.success === true &&
        validSubData.isSubscribed === true,
      `Valid new email subscription returns 201 Created with success: true`
    );

    // --- TEST 4: Duplicate Active Subscription Handling ---
    console.log("\n--- Scenario 4: Duplicate Active Subscription Handling ---");
    const duplicateSubRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail.toUpperCase() }), // Testing normalization as well
    });
    const duplicateSubData = await duplicateSubRes.json();
    assert(
      duplicateSubRes.status === 200 &&
        duplicateSubData.success === true &&
        duplicateSubData.isDuplicate === true &&
        duplicateSubData.isSubscribed === true,
      `Duplicate subscription is handled safely (200 OK, isDuplicate: true)`
    );

    // --- TEST 5: Unsubscribe Behavior ---
    console.log("\n--- Scenario 5: Unsubscribe Behavior ---");
    const unsubRes = await fetch(`${BASE_URL}/newsletter/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const unsubData = await unsubRes.json();
    assert(
      unsubRes.status === 200 &&
        unsubData.success === true &&
        unsubData.isSubscribed === false,
      `Unsubscribe request sets status to unsubscribed (200 OK)`
    );

    // --- TEST 6: Resubscription Behavior ---
    console.log("\n--- Scenario 6: Resubscription Behavior ---");
    const resubRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const resubData = await resubRes.json();
    assert(
      resubRes.status === 200 &&
        resubData.success === true &&
        resubData.isResubscribed === true &&
        resubData.isSubscribed === true,
      `Resubscription reactivates inactive subscription (200 OK, isResubscribed: true)`
    );

    // --- TEST 7: Unsubscribe Non-Existent / Inactive Email ---
    console.log("\n--- Scenario 7: Unsubscribe Non-Existent Email ---");
    const unsubNonExistentRes = await fetch(`${BASE_URL}/newsletter/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `nonexistent_${timestamp}@devstory.local` }),
    });
    const unsubNonExistentData = await unsubNonExistentRes.json();
    assert(
      unsubNonExistentRes.status === 200 && unsubNonExistentData.isSubscribed === false,
      `Unsubscribing non-existent email returns 200 OK with clear message`
    );

    // --- TEST 8: Response Payload Structure ---
    console.log("\n--- Scenario 8: Response Payload Structure ---");
    assert(
      typeof validSubData.message === "string" &&
        typeof resubData.message === "string" &&
        typeof unsubData.message === "string",
      `All API responses include clean, client-friendly message string`
    );

    console.log("\n=================================================");
    console.log(`SUMMARY: ${passedTests} / ${totalTests} Newsletter Backend Tests Passed!`);
    console.log("=================================================");
  } catch (error) {
    console.error("Test execution error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
