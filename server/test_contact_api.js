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

async function runTests() {
  console.log("====================================================================");
  console.log("🚀 DEVSTORY - CONTACT FORM BACKEND TEST SUITE");
  console.log("====================================================================");

  // 1. Verify DB connection
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoose.connection.readyState && uri) {
    await mongoose.connect(uri);
  }
  console.log(`✅ [Database] MongoDB Atlas connected`);

  let createdContactId = null;
  let adminToken = "";

  // Set up an Admin user for testing admin message inspection
  const rand = Math.floor(Math.random() * 1000000);
  const adminEmail = `contactadmin_${rand}@devstory.io`;
  const adminUser = await User.create({
    name: "Contact Admin",
    email: adminEmail,
    password: "Password@123",
    role: "admin",
  });
  adminToken = adminUser.generateAuthToken();

  // -------------------------------------------------------------------------
  // TEST 1: Valid Contact Submission
  // -------------------------------------------------------------------------
  console.log("\n--- Test 1: Valid Contact Submission ---");
  const validRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ada Lovelace",
      email: "ada.lovelace@devstory.io",
      subject: "Collaboration on Distributed Systems Article",
      message: "Hello DevStory team, I loved your recent distributed caching guide and would like to collaborate on an article!",
    }),
  });

  const validData = await validRes.json();
  assert(validRes.status === 201, "Valid submission returns 201 Created");
  assert(validData.success === true, "Response returns success: true");
  assert(validData.data && validData.data.id, "Response returns created contact ID");
  assert(validData.data.status === "unread", "Initial contact status is 'unread'");
  assert(validData.data.name === "Ada Lovelace", "Stored name matches input");
  assert(validData.data.email === "ada.lovelace@devstory.io", "Stored email matches input");
  createdContactId = validData.data.id;

  // -------------------------------------------------------------------------
  // TEST 2: Missing Name
  // -------------------------------------------------------------------------
  console.log("\n--- Test 2: Missing Name Validation ---");
  const missingNameRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "   ",
      email: "valid@example.com",
      subject: "Test Subject",
      message: "Valid message content here that exceeds minimum length.",
    }),
  });
  const missingNameData = await missingNameRes.json();
  assert(missingNameRes.status === 400, "Missing/blank name returns 400 Bad Request");
  assert(missingNameData.message.includes("Name is required"), "Returns clear 'Name is required' error message");

  // -------------------------------------------------------------------------
  // TEST 3: Missing Email
  // -------------------------------------------------------------------------
  console.log("\n--- Test 3: Missing Email Validation ---");
  const missingEmailRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Alan Turing",
      email: "",
      subject: "Test Subject",
      message: "Valid message content here that exceeds minimum length.",
    }),
  });
  const missingEmailData = await missingEmailRes.json();
  assert(missingEmailRes.status === 400, "Missing email returns 400 Bad Request");
  assert(missingEmailData.message.includes("Email address is required"), "Returns clear 'Email address is required' error message");

  // -------------------------------------------------------------------------
  // TEST 4: Invalid Email Format
  // -------------------------------------------------------------------------
  console.log("\n--- Test 4: Invalid Email Format Validation ---");
  const invalidEmailRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Grace Hopper",
      email: "invalid-email-format-without-at",
      subject: "Test Subject",
      message: "Valid message content here that exceeds minimum length.",
    }),
  });
  const invalidEmailData = await invalidEmailRes.json();
  assert(invalidEmailRes.status === 400, "Invalid email format returns 400 Bad Request");
  assert(invalidEmailData.message.includes("valid email address"), "Returns clear 'Please provide a valid email address' error message");

  // -------------------------------------------------------------------------
  // TEST 5: Missing Subject
  // -------------------------------------------------------------------------
  console.log("\n--- Test 5: Missing Subject Validation ---");
  const missingSubjRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Grace Hopper",
      email: "grace@navy.mil",
      subject: "   ",
      message: "Valid message content here that exceeds minimum length.",
    }),
  });
  const missingSubjData = await missingSubjRes.json();
  assert(missingSubjRes.status === 400, "Missing subject returns 400 Bad Request");
  assert(missingSubjData.message.includes("Subject is required"), "Returns clear 'Subject is required' error message");

  // -------------------------------------------------------------------------
  // TEST 6: Missing Message
  // -------------------------------------------------------------------------
  console.log("\n--- Test 6: Missing Message Validation ---");
  const missingMsgRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Grace Hopper",
      email: "grace@navy.mil",
      subject: "Compilers Inquiry",
      message: "   ",
    }),
  });
  const missingMsgData = await missingMsgRes.json();
  assert(missingMsgRes.status === 400, "Missing message returns 400 Bad Request");
  assert(missingMsgData.message.includes("Message is required"), "Returns clear 'Message is required' error message");

  // -------------------------------------------------------------------------
  // TEST 7: Short Message (< 10 characters)
  // -------------------------------------------------------------------------
  console.log("\n--- Test 7: Short Message Validation ---");
  const shortMsgRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Linus Torvalds",
      email: "linus@kernel.org",
      subject: "Kernel Talk",
      message: "Too short",
    }),
  });
  const shortMsgData = await shortMsgRes.json();
  assert(shortMsgRes.status === 400, "Short message (< 10 chars) returns 400 Bad Request");
  assert(shortMsgData.message.includes("at least 10 characters"), "Returns minimum length validation error");

  // -------------------------------------------------------------------------
  // TEST 8: Excessively Long Input (Message > 5000 chars)
  // -------------------------------------------------------------------------
  console.log("\n--- Test 8: Excessively Long Message Validation ---");
  const giantMessage = "a".repeat(5001);
  const longMsgRes = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Spam Bot",
      email: "spambot@example.com",
      subject: "Huge payload",
      message: giantMessage,
    }),
  });
  const longMsgData = await longMsgRes.json();
  assert(longMsgRes.status === 400, "Message exceeding 5000 chars returns 400 Bad Request");
  assert(longMsgData.message.includes("cannot exceed 5000 characters"), "Returns maximum length validation error");

  // -------------------------------------------------------------------------
  // TEST 9: Direct Database Verification in MongoDB Atlas
  // -------------------------------------------------------------------------
  console.log("\n--- Test 9: MongoDB Atlas Storage Verification ---");
  const dbContact = await Contact.findById(createdContactId);
  assert(dbContact !== null, "Contact message found in MongoDB Atlas");
  assert(dbContact.name === "Ada Lovelace", "Database name matches exactly");
  assert(dbContact.email === "ada.lovelace@devstory.io", "Database email matches exactly");
  assert(dbContact.status === "unread", "Database default status is 'unread'");
  assert(dbContact.createdAt instanceof Date, "Database createdAt timestamp is populated");

  // -------------------------------------------------------------------------
  // TEST 10: Admin Message Listing & Status Update
  // -------------------------------------------------------------------------
  console.log("\n--- Test 10: Admin Inbox Management ---");
  // Admin list
  const adminListRes = await fetch(`${API_BASE}/contact`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminListData = await adminListRes.json();
  assert(adminListRes.status === 200, "Admin can retrieve contact messages (200 OK)");
  assert(adminListData.messages && adminListData.messages.length > 0, "Admin receives array of contact inquiries");
  assert(typeof adminListData.unreadCount === "number", "Admin receives unread count metric");

  // Admin update status to 'read'
  const updateStatusRes = await fetch(`${API_BASE}/contact/${createdContactId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "read" }),
  });
  const updateStatusData = await updateStatusRes.json();
  assert(updateStatusRes.status === 200, "Admin can update message status to 'read' (200 OK)");
  assert(updateStatusData.contact.status === "read", "Updated status persisted in MongoDB");

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------
  console.log("\n--- Cleanup Test Records ---");
  await Contact.findByIdAndDelete(createdContactId);
  await User.findByIdAndDelete(adminUser._id);
  console.log("✅ Cleaned up test contact inquiry and test admin user.");

  console.log("\n====================================================================");
  console.log("🎉 ALL CONTACT FORM BACKEND TESTS PASSED (100%)");
  console.log("====================================================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
