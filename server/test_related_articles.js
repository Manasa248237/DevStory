import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Article from "./models/Article.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

const API_BASE = "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runRelatedArticlesTests() {
  console.log("=================================================");
  console.log("DEVSTORY - RELATED ARTICLES FEATURE TEST SUITE");
  console.log("=================================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for test fixture setup.");

  const rand = Date.now();
  const testAuthor = await User.create({
    name: `Related Tester ${rand}`,
    email: `related_tester_${rand}@devstory.local`,
    password: "Password123!",
  });

  const createdArticles = [];

  try {
    // 1. Setup Test Articles
    console.log("--- Setting up test articles across categories and tags ---");

    // Target Article (Category: "Distributed Systems", Tags: ["Kafka", "Redis", "Queues"])
    const targetArticle = await Article.create({
      title: `Main Event Streaming Article ${rand}`,
      category: "Distributed Systems",
      tags: ["Kafka", "Redis", "Queues"],
      content: "Detailed architectural breakdown of event streaming queues and distributed caches.",
      author: testAuthor._id,
      status: "published",
    });
    createdArticles.push(targetArticle);

    // Rel 1: Same category + 2 matching tags ("Distributed Systems", Tags: ["Kafka", "Redis"]) -> High score (10 + 4 = 14)
    const rel1 = await Article.create({
      title: `Redis and Kafka Stream Architecture ${rand}`,
      category: "Distributed Systems",
      tags: ["Kafka", "Redis", "Golang"],
      content: "Combining Redis pub-sub with Kafka distributed log brokers.",
      author: testAuthor._id,
      status: "published",
    });
    createdArticles.push(rel1);

    // Rel 2: Same category only ("Distributed Systems", Tags: ["Docker", "Kubernetes"]) -> Medium score (10 + 0 = 10)
    const rel2 = await Article.create({
      title: `Container Orchestration for Distributed Nodes ${rand}`,
      category: "Distributed Systems",
      tags: ["Docker", "Kubernetes"],
      content: "Orchestrating containerized nodes across multiple cloud regions.",
      author: testAuthor._id,
      status: "published",
    });
    createdArticles.push(rel2);

    // Rel 3: Different category, but 2 matching tags ("Backend", Tags: ["Kafka", "Queues"]) -> Tag score (0 + 4 = 4)
    const rel3 = await Article.create({
      title: `Message Queue Retry Patterns in Node.js ${rand}`,
      category: "Backend",
      tags: ["Kafka", "Queues", "Node.js"],
      content: "Designing resilient exponential backoff retry policies for message consumers.",
      author: testAuthor._id,
      status: "published",
    });
    createdArticles.push(rel3);

    // Rel 4 (Draft): Same category + matching tags, BUT status is "draft" -> MUST NOT BE RETURNED
    const draftArticle = await Article.create({
      title: `Confidential Draft on Kafka Internals ${rand}`,
      category: "Distributed Systems",
      tags: ["Kafka", "Redis"],
      content: "Internal notes and unverified benchmarks for Kafka cluster tuning.",
      author: testAuthor._id,
      status: "draft",
    });
    createdArticles.push(draftArticle);

    // Isolated Article (Unique category and unique tags) -> Should have 0 related articles
    const isolatedArticle = await Article.create({
      title: `Quantum Cryptography Horizons ${rand}`,
      category: "Quantum Mechanics",
      tags: ["Qubits", "Entanglement", "Superposition"],
      content: "Exploring post-quantum lattice cryptography and quantum key distribution.",
      author: testAuthor._id,
      status: "published",
    });
    createdArticles.push(isolatedArticle);

    console.log("Test fixtures populated.\n");

    // -----------------------------------------------------------------
    // TEST 1: Retrieve Related Articles for Target Article (by Slug)
    // -----------------------------------------------------------------
    console.log("--- Test 1: Category & Tag Matching Relevance ---");
    const res1 = await fetch(`${API_BASE}/articles/${targetArticle.slug}/related?limit=5`);
    const data1 = await res1.json();

    assert(res1.status === 200, "GET /api/articles/:slug/related returns 200 OK");
    assert(data1.success === true, "Response has success: true");
    assert(Array.isArray(data1.articles), "Response returns articles array");
    assert(data1.count === 3, `Expected 3 published related articles (got ${data1.count})`);

    // Verify ordering: Rel 1 (same category + shared tags) should be first
    assert(data1.articles[0].slug === rel1.slug, `Highest ranked article is "${data1.articles[0].title}" (Category + Shared Tags)`);

    // -----------------------------------------------------------------
    // TEST 2: Self-Exclusion Verification
    // -----------------------------------------------------------------
    console.log("\n--- Test 2: Target Article Never in Its Own Related List ---");
    const containsSelf = data1.articles.some(
      (a) => String(a._id) === String(targetArticle._id) || a.slug === targetArticle.slug
    );
    assert(!containsSelf, "Current article is strictly excluded from its own related list");

    // -----------------------------------------------------------------
    // TEST 3: Draft Privacy Enforcement
    // -----------------------------------------------------------------
    console.log("\n--- Test 3: Draft Articles Excluded ---");
    const containsDraft = data1.articles.some(
      (a) => String(a._id) === String(draftArticle._id) || a.status === "draft"
    );
    assert(!containsDraft, "Draft articles are strictly excluded from public related list");

    // -----------------------------------------------------------------
    // TEST 4: Projection Verification (No content field leakage)
    // -----------------------------------------------------------------
    console.log("\n--- Test 4: Card Field Projection & Performance ---");
    for (const art of data1.articles) {
      assert(art.title !== undefined, "Article has title");
      assert(art.slug !== undefined, "Article has slug");
      assert(art.category !== undefined, "Article has category");
      assert(art.readTime !== undefined, "Article has readTime");
      assert(art.author && typeof art.author === "object", "Article has populated author");
      assert(art.content === undefined, "Heavy content field is excluded from related cards");
    }

    // -----------------------------------------------------------------
    // TEST 5: Limit Parameter Bounding
    // -----------------------------------------------------------------
    console.log("\n--- Test 5: Limit Parameter Support ---");
    const resLimit = await fetch(`${API_BASE}/articles/${targetArticle.slug}/related?limit=2`);
    const dataLimit = await resLimit.json();
    assert(resLimit.status === 200, "GET /api/articles/:slug/related?limit=2 returns 200 OK");
    assert(dataLimit.articles.length === 2, `Result count is limited to 2 (got ${dataLimit.articles.length})`);

    // -----------------------------------------------------------------
    // TEST 6: Isolated Article with No Related Stories
    // -----------------------------------------------------------------
    console.log("\n--- Test 6: Zero Related Articles Scenario ---");
    const resIsolated = await fetch(`${API_BASE}/articles/${isolatedArticle.slug}/related`);
    const dataIsolated = await resIsolated.json();
    assert(resIsolated.status === 200, "Isolated article returns 200 OK");
    assert(dataIsolated.success === true, "Response has success: true");
    assert(dataIsolated.count === 0, "Count is 0 for isolated article");
    assert(dataIsolated.articles.length === 0, "Empty array returned gracefully");

    // -----------------------------------------------------------------
    // TEST 7: Query by MongoDB ObjectId
    // -----------------------------------------------------------------
    console.log("\n--- Test 7: Query by MongoDB ObjectId ---");
    const resId = await fetch(`${API_BASE}/articles/${targetArticle._id}/related`);
    const dataId = await resId.json();
    assert(resId.status === 200, "GET /api/articles/:id/related returns 200 OK");
    assert(dataId.articles.length === 3, "Resolves correctly using ObjectId");

    // -----------------------------------------------------------------
    // TEST 8: Non-Existent Article 404
    // -----------------------------------------------------------------
    console.log("\n--- Test 8: Non-Existent Article Handling ---");
    const res404 = await fetch(`${API_BASE}/articles/non-existent-article-slug-xyz/related`);
    assert(res404.status === 404, "Non-existent article returns 404 Not Found");

  } finally {
    console.log("\n--- Cleaning up test fixtures ---");
    const idsToDelete = createdArticles.map((a) => a._id);
    await Article.deleteMany({ _id: { $in: idsToDelete } });
    await User.deleteOne({ _id: testAuthor._id });
    await mongoose.disconnect();
    console.log("Cleanup complete and disconnected from DB.");
  }

  console.log("\n=================================================");
  console.log("🎉 ALL RELATED ARTICLES TESTS PASSED (100%)");
  console.log("=================================================");
}

runRelatedArticlesTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
