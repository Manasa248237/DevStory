import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import http from "http";
import app from "./app.js";
import Article from "./models/Article.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

async function verifyMetadataSystem() {
  console.log("=================================================");
  console.log("DEVSTORY - ARTICLE METADATA VERIFICATION TEST");
  console.log("=================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ [MongoDB Atlas] Connected successfully\n");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passedTests = 0;
  let totalTests = 8;
  let testArticle = null;
  let testUser = null;

  try {
    // Create test user and article
    testUser = await User.create({
      name: "Metadata Tester",
      email: `meta_${Date.now()}@devstory.local`,
      password: "Password@123!",
    });

    testArticle = await Article.create({
      title: "Optimizing Web Vitals and Distributed Caching",
      excerpt: "A comprehensive guide on performance tuning, edge caching, and server-side rendering architecture.",
      content: "<h2>Web Vitals Overview</h2><p>Here is an in-depth breakdown of Core Web Vitals.</p>",
      category: "Technology",
      tags: ["Performance", "WebDev", "Caching"],
      author: testUser._id,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      status: "published",
    });

    console.log(`Created test article: "${testArticle.title}" (slug: ${testArticle.slug})`);

    // 1. Fetch Article Page HTML
    const articleRes = await fetch(`${baseUrl}/articles/${testArticle.slug}`);
    const articleHtml = await articleRes.text();

    // Verification 1: Title Tag
    if (articleHtml.includes(`<title>${testArticle.title} | DevStory</title>`)) {
      console.log("✅ [PASS] 1. Dynamic Page <title> correctly rendered with article title.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 1. Title tag missing article title in HTML response.");
    }

    // Verification 2: Meta Description
    if (articleHtml.includes(testArticle.excerpt)) {
      console.log("✅ [PASS] 2. Meta description correctly populated with article excerpt.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 2. Meta description missing article excerpt.");
    }

    // Verification 3: Open Graph Title & Description
    if (
      articleHtml.includes(`property="og:title" content="${testArticle.title} | DevStory"`) &&
      articleHtml.includes(`property="og:description" content="${testArticle.excerpt}"`)
    ) {
      console.log("✅ [PASS] 3. Open Graph og:title and og:description match article data.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 3. Open Graph title/description mismatch.");
    }

    // Verification 4: Open Graph Image
    const escapedThumbnail = testArticle.thumbnail.replace(/&/g, "&amp;");
    if (
      articleHtml.includes(`property="og:image" content="${escapedThumbnail}"`) ||
      articleHtml.includes(`property="og:image" content="${testArticle.thumbnail}"`)
    ) {
      console.log("✅ [PASS] 4. Open Graph og:image correctly contains article thumbnail URL.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 4. Open Graph og:image missing thumbnail URL.");
    }

    // Verification 5: Open Graph Type = article
    if (articleHtml.includes('property="og:type" content="article"')) {
      console.log('✅ [PASS] 5. Open Graph og:type correctly set to "article".');
      passedTests++;
    } else {
      console.error("❌ [FAIL] 5. Open Graph og:type is not 'article'.");
    }

    // Verification 6: Twitter / X Card Tags
    if (
      articleHtml.includes('name="twitter:card" content="summary_large_image"') &&
      articleHtml.includes(`name="twitter:title" content="${testArticle.title} | DevStory"`) &&
      (articleHtml.includes(`name="twitter:image" content="${escapedThumbnail}"`) ||
        articleHtml.includes(`name="twitter:image" content="${testArticle.thumbnail}"`))
    ) {
      console.log("✅ [PASS] 6. Twitter Card metadata (summary_large_image, title, image) verified.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 6. Twitter Card metadata missing or mismatched.");
    }

    // Verification 7: Canonical / OG URL
    if (articleHtml.includes(`property="og:url" content="`)) {
      console.log("✅ [PASS] 7. Open Graph og:url canonical link generated dynamically.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 7. Open Graph og:url missing.");
    }

    // Verification 8: Home Page returns default site metadata
    const homeRes = await fetch(`${baseUrl}/`);
    const homeHtml = await homeRes.text();
    if (
      homeHtml.includes("<title>DevStory | Personal Tech Blog") &&
      homeHtml.includes('property="og:type" content="website"')
    ) {
      console.log("✅ [PASS] 8. Home page preserves default website Open Graph metadata.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 8. Home page metadata affected.");
    }

  } catch (err) {
    console.error("❌ Test exception:", err);
  } finally {
    if (testArticle) await Article.findByIdAndDelete(testArticle._id);
    if (testUser) await User.findByIdAndDelete(testUser._id);
    await mongoose.disconnect();
    server.close();

    console.log("\n=================================================");
    console.log(`SUMMARY: ${passedTests}/${totalTests} METADATA TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log("=================================================");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

verifyMetadataSystem();
