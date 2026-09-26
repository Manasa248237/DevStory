import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Article from "./models/Article.js";
import User from "./models/User.js";
import { clearViewCooldownCache } from "./controllers/articleController.js";

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

async function runViewCountTests() {
  console.log("=================================================");
  console.log("DEVSTORY - ARTICLE VIEW COUNT FEATURE TEST SUITE");
  console.log("=================================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for test fixture setup.");

  const rand = Date.now();
  const signupRes = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `View Count Author ${rand}`,
      email: `view_tester_${rand}@devstory.local`,
      password: "Password123!",
    }),
  });
  const signupData = await signupRes.json();
  const token = signupData.token;
  const testAuthor = signupData.user;
  const createdArticles = [];

  try {
    // -----------------------------------------------------------------
    // TEST 1: Initial View Count is 0 on Creation
    // -----------------------------------------------------------------
    console.log("--- Test 1: Initial viewCount is 0 ---");
    const createRes = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `View Count Verification Article ${rand}`,
        category: "Technology",
        content: "Detailed testing article on database atomicity and view metric tracking.",
        status: "published",
        viewCount: 99999, // Should be ignored by backend
      }),
    });

    const createData = await createRes.json();
    if (createRes.status !== 201) {
      console.log("createRes failure status:", createRes.status, "body:", createData);
    }
    assert(createRes.status === 201, "POST /api/articles returns 201 Created");
    assert(createData.article.viewCount === 0, `New article viewCount initialized to 0 (arbitrary client input ignored: got ${createData.article.viewCount})`);

    const articleSlug = createData.article.slug;
    const articleId = createData.article._id;
    createdArticles.push(createData.article);

    // -----------------------------------------------------------------
    // TEST 2: First Article Visit Increments viewCount to 1
    // -----------------------------------------------------------------
    console.log("\n--- Test 2: First Article Visit Increments View Count ---");
    // Clear cooldown cache to simulate fresh first visit
    clearViewCooldownCache();

    const visit1Res = await fetch(`${API_BASE}/articles/${articleSlug}`);
    const visit1Data = await visit1Res.json();
    assert(visit1Res.status === 200, "GET /api/articles/:slug returns 200 OK");
    assert(visit1Data.article.viewCount === 1, `First visit increments viewCount to 1 (got ${visit1Data.article.viewCount})`);

    // Verify database persistence
    const dbArticle1 = await Article.findById(articleId);
    assert(dbArticle1.viewCount === 1, `MongoDB persisted viewCount is 1 (got ${dbArticle1.viewCount})`);

    // -----------------------------------------------------------------
    // TEST 3: Repeated Refresh & Multiple Rapid API Calls (Deduplication)
    // -----------------------------------------------------------------
    console.log("\n--- Test 3: Repeated Refresh within Cooldown Window ---");
    // Rapidly request the same article 3 times without clearing cooldown
    const refresh1 = await (await fetch(`${API_BASE}/articles/${articleSlug}`)).json();
    const refresh2 = await (await fetch(`${API_BASE}/articles/${articleSlug}`)).json();
    const refresh3 = await (await fetch(`${API_BASE}/articles/${articleSlug}`)).json();

    assert(refresh1.article.viewCount === 1, `Immediate refresh 1 retains viewCount: 1 (got ${refresh1.article.viewCount})`);
    assert(refresh2.article.viewCount === 1, `Immediate refresh 2 retains viewCount: 1 (got ${refresh2.article.viewCount})`);
    assert(refresh3.article.viewCount === 1, `Immediate refresh 3 retains viewCount: 1 (got ${refresh3.article.viewCount})`);

    const dbArticleAfterSpam = await Article.findById(articleId);
    assert(dbArticleAfterSpam.viewCount === 1, "MongoDB viewCount was not inflated by rapid refreshes");

    // -----------------------------------------------------------------
    // TEST 4: New Visitor / Cooldown Expiration Increments Count
    // -----------------------------------------------------------------
    console.log("\n--- Test 4: Subsequent Visitor Increments View Count ---");
    clearViewCooldownCache(); // Simulates new visitor or TTL expiration

    const visit2Res = await fetch(`${API_BASE}/articles/${articleSlug}`, {
      headers: {
        "User-Agent": "DifferentBrowser/2.0 (Mobile; Android 14)",
      },
    });
    const visit2Data = await visit2Res.json();
    assert(visit2Res.status === 200, "GET /api/articles/:slug returns 200 OK");
    assert(visit2Data.article.viewCount === 2, `Second visitor increments viewCount to 2 (got ${visit2Data.article.viewCount})`);

    const dbArticle2 = await Article.findById(articleId);
    assert(dbArticle2.viewCount === 2, `MongoDB persisted viewCount is 2 (got ${dbArticle2.viewCount})`);

    // -----------------------------------------------------------------
    // TEST 5: Draft Article Never Increments Views
    // -----------------------------------------------------------------
    console.log("\n--- Test 5: Draft Article Never Increments Views ---");
    const draftArticle = await Article.create({
      title: `Confidential Draft Views Test ${rand}`,
      category: "Productivity",
      content: "Secret content that should not accumulate public views.",
      author: testAuthor._id || testAuthor.id,
      status: "draft",
      viewCount: 0,
    });
    createdArticles.push(draftArticle);

    // Author accesses draft article 3 times
    clearViewCooldownCache();
    const draftRes1 = await fetch(`${API_BASE}/articles/${draftArticle.slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const draftData1 = await draftRes1.json();
    assert(draftRes1.status === 200, "Author can preview own draft (200 OK)");
    assert(draftData1.article.viewCount === 0, `Draft viewCount remains 0 after author access (got ${draftData1.article.viewCount})`);

    const dbDraft = await Article.findById(draftArticle._id);
    assert(dbDraft.viewCount === 0, "MongoDB draft viewCount remains 0");

    // -----------------------------------------------------------------
    // TEST 6: Invalid / Non-Existent Article Handling
    // -----------------------------------------------------------------
    console.log("\n--- Test 6: Invalid / Non-Existent Article Handling ---");
    const invalidRes = await fetch(`${API_BASE}/articles/non-existent-slug-xyz-999`);
    assert(invalidRes.status === 404, "Non-existent article returns 404 Not Found");

    // -----------------------------------------------------------------
    // TEST 7: Arbitrary viewCount Submission in PUT is Ignored
    // -----------------------------------------------------------------
    console.log("\n--- Test 7: Arbitrary viewCount Submission in PUT is Ignored ---");
    const putRes = await fetch(`${API_BASE}/articles/${articleSlug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `Updated Title for View Test ${rand}`,
        viewCount: 888888, // Must be ignored
      }),
    });
    const putData = await putRes.json();
    assert(putRes.status === 200, "PUT /api/articles/:slug returns 200 OK");
    assert(putData.article.viewCount === 2, `viewCount cannot be manually forged via update API (got ${putData.article.viewCount})`);

    const currentSlug = putData.article.slug || articleSlug;

    // -----------------------------------------------------------------
    // TEST 8: Explicit POST /api/articles/:idOrSlug/view Endpoint
    // -----------------------------------------------------------------
    console.log("\n--- Test 8: Explicit POST /view Endpoint ---");
    const postViewRes = await fetch(`${API_BASE}/articles/${currentSlug}/view`, {
      method: "POST",
      headers: { "User-Agent": "VisitorThree/1.0" },
    });
    const postViewData = await postViewRes.json();
    if (postViewRes.status !== 200) {
      console.log("postView failure status:", postViewRes.status, "body:", postViewData);
    }
    assert(postViewRes.status === 200, "POST /api/articles/:slug/view returns 200 OK");
    assert(postViewData.counted === true, "POST /view reports counted: true");
    assert(postViewData.viewCount === 3, `POST /view increments count to 3 (got ${postViewData.viewCount})`);

    // Immediate duplicate call to POST /view from same visitor is throttled
    const postViewDupeRes = await fetch(`${API_BASE}/articles/${currentSlug}/view`, {
      method: "POST",
      headers: { "User-Agent": "VisitorThree/1.0" },
    });
    const postViewDupeData = await postViewDupeRes.json();
    assert(postViewDupeData.counted === false, "Duplicate POST /view reports counted: false (throttled)");
    assert(postViewDupeData.viewCount === 3, "Duplicate POST /view retains viewCount: 3");

  } finally {
    console.log("\n--- Cleaning up test fixtures ---");
    const ids = createdArticles.map((a) => a._id || a.id);
    await Article.deleteMany({ _id: { $in: ids } });
    if (testAuthor?._id || testAuthor?.id) {
      await User.deleteOne({ _id: testAuthor._id || testAuthor.id });
    }
    await mongoose.disconnect();
    console.log("Cleanup complete and disconnected from DB.");
  }

  console.log("\n=================================================");
  console.log("🎉 ALL ARTICLE VIEW COUNT TESTS PASSED (100%)");
  console.log("=================================================");
}

runViewCountTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
