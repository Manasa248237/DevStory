import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const BASE_URL = process.env.API_URL || "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("DEVSTORY - DRAFT AUTO-SAVE & LIFECYCLE TEST SUITE");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const authorEmail = `author_draft_${timestamp}@devstory.io`;
  const attackerEmail = `attacker_draft_${timestamp}@devstory.io`;
  const adminEmail = `admin_draft_${timestamp}@devstory.io`;
  const password = "Password123!";

  console.log("--- Step 1: Registering Test Users ---");

  // Register Author
  const authorSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Draft Author",
      email: authorEmail,
      password,
    }),
  });
  const authorData = await authorSignupRes.json();
  assert(authorSignupRes.status === 201, "Author created successfully");
  const authorToken = authorData.token;
  const authorId = authorData.user.id || authorData.user._id;

  // Register Attacker
  const attackerSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Malicious User",
      email: attackerEmail,
      password,
    }),
  });
  const attackerData = await attackerSignupRes.json();
  assert(attackerSignupRes.status === 201, "Attacker created successfully");
  const attackerToken = attackerData.token;

  // Register Admin
  const adminSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Admin Moderator",
      email: adminEmail,
      password,
    }),
  });
  const adminData = await adminSignupRes.json();
  assert(adminSignupRes.status === 201, "Admin user created successfully");

  // Elevate admin in DB and sign in to get refreshed JWT token
  const { connectDB } = await import("./config/db.js");
  await connectDB();
  const { default: User } = await import("./models/User.js");
  await User.updateOne({ email: adminEmail }, { role: "admin" });

  const adminLoginRes = await fetch(`${BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;

  console.log("\n--- Test 2: Auto-save New Draft (POST /api/articles with status: draft) ---");
  const draftCreateRes = await fetch(`${BASE_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Draft: Event-Driven Kafka Microservices ${timestamp}`,
      content: "<p>Initial auto-saved draft content exploring Apache Kafka patterns.</p>",
      category: "Architecture",
      tags: ["Kafka", "Microservices", "Event-Driven"],
      status: "draft",
    }),
  });
  const draftCreateData = await draftCreateRes.json();
  assert(draftCreateRes.status === 201, "POST /api/articles with status: draft returns 201 Created");
  assert(draftCreateData.success === true, "Response has success: true");
  assert(draftCreateData.article.status === "draft", "Article status is strictly 'draft'");
  assert(Boolean(draftCreateData.article.slug), "Draft generated unique slug");
  const draftId = draftCreateData.article._id;
  const draftSlug = draftCreateData.article.slug;

  console.log("\n--- Test 3: Verify Draft Privacy (Hidden from Public Articles Feed) ---");
  const publicFeedRes = await fetch(`${BASE_URL}/articles`);
  const publicFeedData = await publicFeedRes.json();
  assert(publicFeedRes.status === 200, "GET /api/articles returns 200 OK");
  const inPublicFeed = publicFeedData.articles.some((a) => a._id === draftId || a.slug === draftSlug);
  assert(!inPublicFeed, "Draft article is NOT visible in public articles listing");

  console.log("\n--- Test 4: Verify Draft Visible in Author's /my-articles ---");
  const myArticlesRes = await fetch(`${BASE_URL}/articles/my-articles`, {
    headers: { Authorization: `Bearer ${authorToken}` },
  });
  const myArticlesData = await myArticlesRes.json();
  assert(myArticlesRes.status === 200, "GET /api/articles/my-articles returns 200 OK");
  const inMyArticles = myArticlesData.articles.some((a) => a._id === draftId);
  assert(inMyArticles, "Draft article is present in author's /my-articles");

  console.log("\n--- Test 5: Auto-save Debounced Updates to Existing Draft (PUT /api/articles/:id) ---");
  const draftUpdateRes = await fetch(`${BASE_URL}/articles/${draftId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Draft: Event-Driven Kafka Microservices v2 ${timestamp}`,
      content: "<p>Updated draft content with detailed schema registry examples and CQRS patterns.</p>",
      status: "draft",
    }),
  });
  const draftUpdateData = await draftUpdateRes.json();
  assert(draftUpdateRes.status === 200, "PUT /api/articles/:id returns 200 OK");
  assert(draftUpdateData.article.title.includes("v2"), "Draft title updated successfully");
  assert(draftUpdateData.article.status === "draft", "Article remains in 'draft' status");

  console.log("\n--- Test 6: Unauthorized Modification Rejection (Attacker cannot auto-save author's draft) ---");
  const unauthorizedUpdateRes = await fetch(`${BASE_URL}/articles/${draftId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attackerToken}`,
    },
    body: JSON.stringify({
      title: "Hijacked Draft Title",
      content: "<p>Malicious content overwrite attempt.</p>",
      status: "draft",
    }),
  });
  assert(unauthorizedUpdateRes.status === 403, "Unauthorized draft update returns 403 Forbidden");

  console.log("\n--- Test 7: Admin Auto-Save / Override Privileges ---");
  const adminUpdateRes = await fetch(`${BASE_URL}/articles/${draftId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      excerpt: "Moderated technical excerpt added by admin reviewer.",
      status: "draft",
    }),
  });
  assert(adminUpdateRes.status === 200, "Admin can update draft without 403 (returns 200 OK)");

  console.log("\n--- Test 8: Publishing a Saved Draft (Explicit Publish Action) ---");
  const publishRes = await fetch(`${BASE_URL}/articles/${draftId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      status: "published",
    }),
  });
  const publishData = await publishRes.json();
  assert(publishRes.status === 200, "Publishing draft returns 200 OK");
  assert(publishData.article.status === "published", "Article status successfully transitioned to 'published'");

  console.log("\n--- Test 9: Verify Published Article in Public Feed ---");
  const updatedFeedRes = await fetch(`${BASE_URL}/articles`);
  const updatedFeedData = await updatedFeedRes.json();
  const publishedInFeed = updatedFeedData.articles.some((a) => a._id === draftId);
  assert(publishedInFeed, "Published article is now accessible in the public articles feed");

  console.log("\n--- Test 10: Clean up Test Articles and Users ---");
  // Delete article
  const deleteRes = await fetch(`${BASE_URL}/articles/${draftId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authorToken}` },
  });
  assert(deleteRes.status === 200, "Test article deleted cleanly");

  console.log("\n=================================================");
  console.log("🎉 ALL DRAFT AUTO-SAVE & RECOVERY TESTS PASSED (100%)");
  console.log("=================================================\n");

  if (mongoose.connection?.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
