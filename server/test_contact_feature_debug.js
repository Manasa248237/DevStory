import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import User from "./models/User.js";
import Contact from "./models/Contact.js";
import jwt from "jsonwebtoken";

dotenv.config();

async function runContactDiagnostic() {
  console.log("=================================================");
  console.log("DEVSTORY - CONTACT FORM DIAGNOSTIC & VERIFICATION");
  console.log("=================================================");

  // 1. Ensure DB Connection
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment");
  }
  await mongoose.connect(uri);
  console.log("✅ [MongoDB Atlas] Connected successfully\n");

  // 2. Start local ephemeral HTTP server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`🚀 [Test Server] Running on ${baseUrl}\n`);

  try {
    // Test 1: OPTIONS Preflight for /api/contact
    console.log("--- 1. Testing CORS OPTIONS Preflight ---");
    const optionsRes = await fetch(`${baseUrl}/api/contact`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    console.log(`OPTIONS /api/contact status: ${optionsRes.status}`);
    if (optionsRes.status !== 200 && optionsRes.status !== 204) {
      throw new Error(`Expected 200/204 for OPTIONS, got ${optionsRes.status}`);
    }
    console.log("✅ [PASS] CORS Preflight accepted for POST /api/contact\n");

    // Test 2: Valid Contact Submission to Canonical POST /api/contact
    console.log("--- 2. Testing Canonical POST /api/contact ---");
    const validPayload = {
      name: "Diagnostic Tester",
      email: "tester@devstory.local",
      subject: "Architecture Question on Caching",
      message: "This is a diagnostic message to verify full-stack contact form submission.",
    };

    const postRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const postData = await postRes.json();
    console.log(`POST /api/contact status: ${postRes.status}`, postData);
    if (postRes.status !== 201 || !postData.success) {
      throw new Error(`Expected 201 Created, got ${postRes.status}: ${JSON.stringify(postData)}`);
    }
    console.log("✅ [PASS] Canonical POST /api/contact successfully saved to database\n");

    // Test 3: Valid Contact Submission to Root /contact alias
    console.log("--- 3. Testing Compatibility POST /contact ---");
    const rootPostRes = await fetch(`${baseUrl}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validPayload,
        subject: "Root Compatibility Test",
      }),
    });
    const rootPostData = await rootPostRes.json();
    console.log(`POST /contact status: ${rootPostRes.status}`);
    if (rootPostRes.status !== 201 || !rootPostData.success) {
      throw new Error(`Expected 201 Created on /contact, got ${rootPostRes.status}`);
    }
    console.log("✅ [PASS] Compatibility POST /contact alias succeeded\n");

    // Test 4: Validation Errors (Short message)
    console.log("--- 4. Testing Validation Error Handling ---");
    const invalidRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "not-an-email",
        subject: "Hi",
        message: "Too short",
      }),
    });
    const invalidData = await invalidRes.json();
    console.log(`POST /api/contact (invalid) status: ${invalidRes.status}`, invalidData);
    if (invalidRes.status !== 400 || invalidData.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${invalidRes.status}`);
    }
    console.log("✅ [PASS] Validation errors correctly returned as 400 Bad Request\n");

    // Test 5: Admin Access Verification
    console.log("--- 5. Testing Admin Inbox Endpoints ---");
    // Create an admin user token
    const adminUser = await User.findOne({ role: "admin" }) || (await User.create({
      name: "Admin Diagnostic",
      email: `admin_${Date.now()}@devstory.local`,
      password: "Password123!",
      role: "admin",
    }));

    const adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1h" }
    );

    const adminGetRes = await fetch(`${baseUrl}/api/contact`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Accept: "application/json",
      },
    });
    const adminGetData = await adminGetRes.json();
    console.log(`GET /api/contact (admin) status: ${adminGetRes.status}, count: ${adminGetData.contacts?.length}`);
    if (adminGetRes.status !== 200 || !adminGetData.success) {
      throw new Error(`Expected 200 OK for admin GET, got ${adminGetRes.status}`);
    }
    console.log("✅ [PASS] Admin GET /api/contact inbox fetched successfully\n");

    // Clean up created test contact records
    await Contact.deleteMany({ email: { $in: ["tester@devstory.local"] } });
    console.log("🧹 Test records cleaned up successfully");

    console.log("\n=================================================");
    console.log("SUMMARY: ALL CONTACT TESTS PASSED (100% OPERATIONAL)");
    console.log("=================================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runContactDiagnostic().catch((err) => {
  console.error("❌ Diagnostic Failure:", err);
  process.exit(1);
});
