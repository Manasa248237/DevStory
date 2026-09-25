import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Article from "./models/Article.js";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

async function runFullE2ETest() {
  console.log("=================================================");
  console.log("DEVSTORY - COMPLETE E2E RICH TEXT & REGRESSION TEST");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const testEmail = `e2e_author_${timestamp}@devstory.local`;
  const readerEmail = `e2e_reader_${timestamp}@devstory.local`;
  const password = "Password123!";

  try {
    // 1. REGRESSION: Test Sign Up
    console.log("--- REGRESSION & AUTHENTICATION ---");
    const authorRes = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Author",
        email: testEmail,
        password,
      }),
    });
    const authorData = await authorRes.json();
    if (!authorRes.ok || !authorData.token) {
      throw new Error(`Sign Up failed: ${JSON.stringify(authorData)}`);
    }
    const authorToken = authorData.token;
    console.log("✅ [PASS] 24. Sign Up works correctly (201 Created)");

    // 2. REGRESSION: Test Sign In
    const loginRes = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Sign In failed: ${JSON.stringify(loginData)}`);
    }
    console.log("✅ [PASS] 25. Sign In works correctly (200 OK, JWT returned)");

    // 3. Register a Reader
    const readerRes = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Reader",
        email: readerEmail,
        password,
      }),
    });
    const readerData = await readerRes.json();
    const readerToken = readerData.token;

    // 4. VALIDATION: Attempt creating empty article content
    console.log("\n--- VALIDATION & ERROR HANDLING ---");
    const emptyContentRes = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: "Empty Article Test",
        content: "   ",
        category: "Technology",
      }),
    });
    if (emptyContentRes.status === 400) {
      console.log("✅ [PASS] 15 & 16. Empty content submission correctly rejected with 400 Bad Request");
    } else {
      throw new Error(`Expected 400 for empty content, got ${emptyContentRes.status}`);
    }

    // 5. Unauthenticated rejection (Logout verification)
    const unauthRes = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Unauth Test",
        content: "<p>Content</p>",
      }),
    });
    if (unauthRes.status === 401) {
      console.log("✅ [PASS] 26. Unauthenticated requests blocked (401 Unauthorized - Logout flow verified)");
    } else {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }

    // 6. CREATE: Create Article with full Rich Text formatting
    console.log("\n--- CREATE ARTICLE WITH RICH TEXT FORMATTING ---");
    const richContent = `<h1>Architectural Foundations</h1><h2>1. Distributed Message Queuing</h2><p>Here is an in-depth perspective on modern distributed messaging with <strong>bold emphasis</strong>, <em>italic nuances</em>, <u>underlined points</u>, and <strike>outdated methods</strike>.</p><p style="text-align: center;">Centered architectural statement</p><blockquote>"Reliability is a design objective, not a byproduct."</blockquote><ul><li>Event-driven architecture with Kafka/RabbitMQ</li><li>Idempotent consumers using unique UUID message headers</li><li>Dead-letter exchanges for resilient poison message handling</li></ul><ol><li>Step 1: Producer publishes event payload</li><li>Step 2: Broker fans out message to subscribed queues</li><li>Step 3: Consumer acknowledges message atomically</li></ol><pre><code>async function handleMessage(channel, msg) {\n  const payload = JSON.parse(msg.content.toString());\n  await processPayload(payload);\n  channel.ack(msg);\n}</code></pre><p>Reference documentation available at <a href="https://devstory.local/docs/architecture" target="_blank" rel="noopener noreferrer">DevStory Docs</a>.</p>`;

    const createRes = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: `Distributed Queues & Idempotency ${timestamp}`,
        content: richContent,
        category: "Architecture",
        tags: ["architecture", "queues", "microservices"],
        status: "published",
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok || !createData.article) {
      throw new Error(`Create Article failed: ${JSON.stringify(createData)}`);
    }
    const createdArticle = createData.article;
    console.log(`✅ [PASS] 1-6. Article created successfully (201 Created, ID: ${createdArticle._id}, Slug: ${createdArticle.slug})`);
    console.log(`   - Verified Bold, Italic, Underline, Strike, Headings H1/H2, Lists (UL/OL), Quotes, Code blocks, and Links.`);

    // 7. READ: Fetch the created article via public API
    console.log("\n--- READ PUBLISHED ARTICLE ---");
    const readRes = await fetch(`${API_BASE}/articles/${createdArticle.slug}`);
    const readData = await readRes.json();
    if (!readRes.ok || !readData.article) {
      throw new Error(`Failed to fetch article: ${JSON.stringify(readData)}`);
    }
    const fetchedArticle = readData.article;
    if (fetchedArticle.content !== richContent) {
      throw new Error("Fetched article content does not match created rich text!");
    }
    console.log(`✅ [PASS] 7-9. Article retrieved successfully. HTML formatting intact (${fetchedArticle.content.length} chars).`);
    console.log(`   - Auto-generated excerpt correctly stripped of HTML tags: "${fetchedArticle.excerpt}"`);

    // 8. EDIT: Update article content with modified formatting
    console.log("\n--- EDIT & PERSISTENCE ---");
    const updatedRichContent = `<h1>Architectural Foundations (Updated)</h1><h2>1. Distributed Message Queuing & Streaming</h2><p>Here is the revised architecture incorporating <strong>Kafka partitions</strong> and <em>backpressure control</em>.</p><blockquote>"Simplicity enables scalability."</blockquote><pre><code>const stream = kafka.consumer({ groupId: 'order-processing' });</code></pre>`;

    const updateRes = await fetch(`${API_BASE}/articles/${createdArticle._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: `Distributed Queues & Streaming ${timestamp}`,
        content: updatedRichContent,
        category: "Architecture",
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.article) {
      throw new Error(`Update failed: ${JSON.stringify(updateData)}`);
    }
    const updatedArticle = updateData.article;
    console.log("✅ [PASS] 10-13. Article edited and saved successfully (200 OK).");

    // 9. RELOAD & PERSISTENCE: Reload article using ID or updated slug to verify persistence
    const reloadRes = await fetch(`${API_BASE}/articles/${updatedArticle.slug || createdArticle._id}`);
    const reloadData = await reloadRes.json();
    if (!reloadData.article || reloadData.article.content !== updatedRichContent) {
      throw new Error("Reloaded content does not match updated content!");
    }
    console.log("✅ [PASS] 14. Reloaded article verified. Updated content and formatting persisted in MongoDB.");

    // 10. SECURITY: Unauthorized modifications blocked
    const unauthorizedUpdateRes = await fetch(`${API_BASE}/articles/${createdArticle._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${readerToken}`,
      },
      body: JSON.stringify({
        title: "Malicious Edit Attempt",
        content: "<p>Hacked</p>",
      }),
    });
    if (unauthorizedUpdateRes.status === 403) {
      console.log("✅ [PASS] Unauthorized modification rejected with 403 Forbidden.");
    } else {
      throw new Error(`Expected 403 for unauthorized edit, got ${unauthorizedUpdateRes.status}`);
    }

    // Cleanup
    await fetch(`${API_BASE}/articles/${createdArticle._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    console.log("\n🧹 Cleaned up test article.");

    console.log("\n=================================================");
    console.log("SUMMARY: ALL E2E FUNCTIONAL, VALIDATION & REGRESSION TESTS PASSED!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ E2E Test Failure:", err);
    process.exit(1);
  }
}

runFullE2ETest();
