import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Contact from "./models/Contact.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const API_BASE = "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runAdminTests() {
  console.log("====================================================================");
  console.log("🚀 DEVSTORY - ADMIN CONTACT MESSAGE MANAGEMENT TEST SUITE");
  console.log("====================================================================");

  // 1. Ensure DB connection
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoose.connection.readyState && uri) {
    await mongoose.connect(uri);
  }

  const rand = Math.floor(Math.random() * 1000000);

  // Create standard non-admin reader user
  const readerUser = await User.create({
    name: "Standard Reader",
    email: `reader_${rand}@devstory.io`,
    password: "Password@123",
    role: "user",
  });
  const readerToken = readerUser.generateAuthToken();

  // Create admin user
  const adminUser = await User.create({
    name: "Super Admin",
    email: `admin_${rand}@devstory.io`,
    password: "Password@123",
    role: "admin",
  });
  const adminToken = adminUser.generateAuthToken();

  // Create a sample contact message
  const sampleContact = await Contact.create({
    name: "Grace Hopper",
    email: "grace.hopper@navy.mil",
    subject: `Compiler Architecture Inquiry ${rand}`,
    message: "I would like to discuss subroutines and compiler design for modern architectures.",
    status: "unread",
  });

  const contactId = sampleContact._id.toString();

  // -------------------------------------------------------------------------
  // TEST 1: Unauthenticated Access Rejection
  // -------------------------------------------------------------------------
  console.log("\n--- Test 1: Unauthenticated Access Rejection ---");
  const unauthRes = await fetch(`${API_BASE}/contact`);
  assert(unauthRes.status === 401, "Unauthenticated GET /api/contact returns 401 Unauthorized");

  // -------------------------------------------------------------------------
  // TEST 2: Non-Admin Access Rejection
  // -------------------------------------------------------------------------
  console.log("\n--- Test 2: Non-Admin Access Rejection ---");
  const readerGetRes = await fetch(`${API_BASE}/contact`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  assert(readerGetRes.status === 403, "Non-admin GET /api/contact returns 403 Forbidden");

  const readerPatchRes = await fetch(`${API_BASE}/contact/${contactId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${readerToken}`,
    },
    body: JSON.stringify({ status: "read" }),
  });
  assert(readerPatchRes.status === 403, "Non-admin PATCH /api/contact/:id/status returns 403 Forbidden");

  const readerDeleteRes = await fetch(`${API_BASE}/contact/${contactId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  assert(readerDeleteRes.status === 403, "Non-admin DELETE /api/contact/:id returns 403 Forbidden");

  // -------------------------------------------------------------------------
  // TEST 3: Admin List Contact Messages
  // -------------------------------------------------------------------------
  console.log("\n--- Test 3: Admin Message Listing ---");
  const adminListRes = await fetch(`${API_BASE}/contact`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminListData = await adminListRes.json();
  assert(adminListRes.status === 200, "Admin GET /api/contact returns 200 OK");
  assert(Array.isArray(adminListData.messages), "Admin receives messages array");
  assert(typeof adminListData.unreadCount === "number", "Admin receives unreadCount metric");

  // -------------------------------------------------------------------------
  // TEST 4: Admin Get Single Message by ID
  // -------------------------------------------------------------------------
  console.log("\n--- Test 4: Admin Single Message Details ---");
  const adminDetailRes = await fetch(`${API_BASE}/contact/${contactId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminDetailData = await adminDetailRes.json();
  assert(adminDetailRes.status === 200, "Admin GET /api/contact/:id returns 200 OK");
  assert(adminDetailData.contact.name === "Grace Hopper", "Detail sender name matches database record");
  assert(adminDetailData.contact.email === "grace.hopper@navy.mil", "Detail email matches database record");

  // -------------------------------------------------------------------------
  // TEST 5: Admin Search & Status Filter
  // -------------------------------------------------------------------------
  console.log("\n--- Test 5: Admin Search & Status Filters ---");
  const searchRes = await fetch(`${API_BASE}/contact?search=Compiler%20Architecture%20Inquiry%20${rand}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const searchData = await searchRes.json();
  assert(searchRes.status === 200 && searchData.messages.length >= 1, "Admin keyword search locates message");

  const statusFilterRes = await fetch(`${API_BASE}/contact?status=unread`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statusFilterData = await statusFilterRes.json();
  assert(statusFilterRes.status === 200, "Admin status filtering returns 200 OK");
  assert(statusFilterData.messages.every((m) => m.status === "unread"), "All filtered messages have status 'unread'");

  // -------------------------------------------------------------------------
  // TEST 6: Admin Status Updates (Read -> Replied -> Archived)
  // -------------------------------------------------------------------------
  console.log("\n--- Test 6: Admin Status Transitions ---");
  // Mark as read
  const markReadRes = await fetch(`${API_BASE}/contact/${contactId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "read" }),
  });
  const markReadData = await markReadRes.json();
  assert(markReadRes.status === 200 && markReadData.contact.status === "read", "Updated message status to 'read'");

  // Mark as replied
  const markRepliedRes = await fetch(`${API_BASE}/contact/${contactId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "replied" }),
  });
  const markRepliedData = await markRepliedRes.json();
  assert(markRepliedRes.status === 200 && markRepliedData.contact.status === "replied", "Updated message status to 'replied'");

  // Mark as archived
  const markArchivedRes = await fetch(`${API_BASE}/contact/${contactId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "archived" }),
  });
  const markArchivedData = await markArchivedRes.json();
  assert(markArchivedRes.status === 200 && markArchivedData.contact.status === "archived", "Updated message status to 'archived'");

  // Invalid status
  const invalidStatusRes = await fetch(`${API_BASE}/contact/${contactId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "invalid_status_xyz" }),
  });
  assert(invalidStatusRes.status === 400, "Invalid status string rejected with 400 Bad Request");

  // -------------------------------------------------------------------------
  // TEST 7: Invalid & Missing IDs
  // -------------------------------------------------------------------------
  console.log("\n--- Test 7: Invalid & Non-Existent ID Handling ---");
  const missingId = new mongoose.Types.ObjectId().toString();
  const missingRes = await fetch(`${API_BASE}/contact/${missingId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(missingRes.status === 404, "Non-existent message ID returns 404 Not Found");

  // -------------------------------------------------------------------------
  // TEST 8: Admin Delete Message & Verification
  // -------------------------------------------------------------------------
  console.log("\n--- Test 8: Admin Message Deletion ---");
  const deleteRes = await fetch(`${API_BASE}/contact/${contactId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deleteData = await deleteRes.json();
  assert(deleteRes.status === 200 && deleteData.success === true, "Admin successfully deleted message (200 OK)");

  const verifyDeletedRes = await fetch(`${API_BASE}/contact/${contactId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(verifyDeletedRes.status === 404, "Deleted message no longer exists (404 Not Found)");

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------
  await User.findByIdAndDelete(readerUser._id);
  await User.findByIdAndDelete(adminUser._id);
  console.log("✅ Cleaned up test reader and admin users.");

  console.log("\n====================================================================");
  console.log("🎉 ALL ADMIN CONTACT MESSAGE MANAGEMENT TESTS PASSED (100%)");
  console.log("====================================================================");
  process.exit(0);
}

runAdminTests().catch((err) => {
  console.error("Admin Test Suite Failed:", err);
  process.exit(1);
});
