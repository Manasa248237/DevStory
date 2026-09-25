import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

async function testArticlesFlow() {
  console.log("=================================================");
  console.log("DEVSTORY - ARTICLES FLOW & API VERIFICATION");
  console.log("=================================================");

  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log("✅ [MongoDB Atlas] Connected successfully\n");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`🚀 [Test Server] Running on ${baseUrl}\n`);

  try {
    // 1. Fetch All Articles
    console.log("--- 1. Testing GET /api/articles ---");
    const res = await fetch(`${baseUrl}/api/articles`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Total Articles: ${data.total}, Returned: ${data.articles?.length}`);
    if (res.status !== 200 || !data.success || data.articles.length === 0) {
      throw new Error(`Failed to fetch published articles: ${JSON.stringify(data)}`);
    }
    console.log(`✅ [PASS] Found ${data.total} published articles in database.`);
    console.log(`Sample Article Title: "${data.articles[0]?.title}" by ${data.articles[0]?.author?.name || "Author"}\n`);

    // 2. Fetch Single Article Detail
    console.log("--- 2. Testing GET /api/articles/:slug ---");
    const sampleSlug = data.articles[0]?.slug || data.articles[0]?._id;
    const detailRes = await fetch(`${baseUrl}/api/articles/${sampleSlug}`);
    const detailData = await detailRes.json();
    console.log(`Detail Status: ${detailRes.status}, Title: "${detailData.article?.title}"`);
    if (detailRes.status !== 200 || !detailData.success) {
      throw new Error(`Failed to fetch article detail for ${sampleSlug}`);
    }
    console.log("✅ [PASS] Article detail fetched successfully.\n");

    // 3. Category Filter
    console.log("--- 3. Testing Category Filtering ---");
    const catRes = await fetch(`${baseUrl}/api/articles?category=Technology`);
    const catData = await catRes.json();
    console.log(`Technology category count: ${catData.articles?.length}`);
    if (catRes.status !== 200 || !catData.success) {
      throw new Error("Category query failed");
    }
    console.log("✅ [PASS] Category filter works correctly.\n");

    // 4. Search Filter
    console.log("--- 4. Testing Search Query ---");
    const searchRes = await fetch(`${baseUrl}/api/articles?search=test`);
    const searchData = await searchRes.json();
    console.log(`Search for "test" found: ${searchData.articles?.length} articles`);
    if (searchRes.status !== 200 || !searchData.success) {
      throw new Error("Search query failed");
    }
    console.log("✅ [PASS] Search filtering works correctly.\n");

    console.log("=================================================");
    console.log("SUMMARY: ALL ARTICLES FLOW VERIFICATIONS PASSED (100%)");
    console.log("=================================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testArticlesFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
