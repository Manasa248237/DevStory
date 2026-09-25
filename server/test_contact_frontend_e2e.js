import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Contact from "./models/Contact.js";

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

async function runE2ETests() {
  console.log("====================================================================");
  console.log("🚀 DEVSTORY - CONTACT FORM FRONTEND & BACKEND E2E TEST SUITE");
  console.log("====================================================================");

  // 1. Ensure DB connection
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoose.connection.readyState && uri) {
    await mongoose.connect(uri);
  }

  // -------------------------------------------------------------------------
  // 1. Simulated Frontend Form Valid Submission Flow
  // -------------------------------------------------------------------------
  console.log("\n[1] Testing Form Submission with Valid Payload...");
  const validSubmission = {
    name: "Margaret Hamilton",
    email: "margaret@apollo.nasa.gov",
    subject: "Asynchronous Software Engineering Feedback",
    message: "Your recent DevStory articles on fault-tolerant distributed computing were fantastic. Keep up the high standards!",
  };

  const res1 = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validSubmission),
  });
  const data1 = await res1.json();

  assert(res1.status === 201, "Form submission returned 201 Created status");
  assert(data1.success === true, "Response has success: true flag");
  assert(data1.data.name === validSubmission.name, "Returned name matches form state");
  assert(data1.data.email === validSubmission.email, "Returned email matches form state");
  assert(data1.data.subject === validSubmission.subject, "Returned subject matches form state");
  assert(data1.data.status === "unread", "Initial message status is 'unread'");

  const contactId = data1.data.id;

  // Verify in MongoDB
  const savedDoc = await Contact.findById(contactId);
  assert(savedDoc !== null, "Form data successfully retrieved from MongoDB Atlas");
  assert(savedDoc.message === validSubmission.message, "Full message content preserved in DB");

  // -------------------------------------------------------------------------
  // 2. Simulated Frontend Empty / Whitespace Inputs
  // -------------------------------------------------------------------------
  console.log("\n[2] Testing Form Submission with Empty Fields...");
  const emptySubmission = {
    name: "   ",
    email: "   ",
    subject: "   ",
    message: "   ",
  };
  const res2 = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emptySubmission),
  });
  const data2 = await res2.json();
  assert(res2.status === 400 && data2.success === false, "Empty submission rejected with 400 Bad Request");
  assert(data2.message.includes("required"), "Clear error message returned for empty form");

  // -------------------------------------------------------------------------
  // 3. Simulated Frontend Invalid Email Format
  // -------------------------------------------------------------------------
  console.log("\n[3] Testing Form Submission with Invalid Email...");
  const invalidEmailSubmission = {
    name: "Margaret Hamilton",
    email: "not-an-email",
    subject: "Feedback",
    message: "Valid message content with enough characters.",
  };
  const res3 = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidEmailSubmission),
  });
  const data3 = await res3.json();
  assert(res3.status === 400 && data3.success === false, "Invalid email format rejected with 400 Bad Request");

  // -------------------------------------------------------------------------
  // 4. Cleanup
  // -------------------------------------------------------------------------
  console.log("\n[4] Cleaning up test records...");
  await Contact.findByIdAndDelete(contactId);
  console.log("✅ Cleaned up test contact records.");

  console.log("\n====================================================================");
  console.log("🎉 ALL CONTACT FORM E2E TESTS PASSED (100%)");
  console.log("====================================================================");
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
