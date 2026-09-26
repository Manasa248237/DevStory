import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { calculateReadingTime, countWords, calculateReadingTimeMinutes, WORDS_PER_MINUTE } from "./utils/readingTime.js";
import { calculateReadingTime as clientCalculateReadingTime, countWords as clientCountWords } from "../client/src/utils/readingTime.js";
import Article from "./models/Article.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

const API_BASE = "http://localhost:5000/api";

function generateWords(count) {
  const sampleWords = ["algorithm", "architecture", "distributed", "frontend", "performance", "scalability", "database", "security", "component", "interface"];
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(sampleWords[i % sampleWords.length]);
  }
  return words.join(" ");
}

function generateHtmlWords(count) {
  const sampleWords = ["service", "optimization", "microservice", "react", "node", "express", "query", "index", "cache", "payload"];
  const paragraphs = [];
  let remaining = count;
  while (remaining > 0) {
    const pCount = Math.min(50, remaining);
    const pWords = [];
    for (let i = 0; i < pCount; i++) {
      pWords.push(sampleWords[(count - remaining + i) % sampleWords.length]);
    }
    paragraphs.push(`<p><strong>${pWords[0]}</strong> ${pWords.slice(1).join(" ")}.</p>`);
    remaining -= pCount;
  }
  return paragraphs.join("\n");
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runReadingTimeTests() {
  console.log("=================================================");
  console.log("DEVSTORY - AUTOMATIC READING TIME TEST SUITE");
  console.log("=================================================\n");

  // -----------------------------------------------------------------
  // 1. UNIT TESTS: Reading Time Algorithm & Word Counting
  // -----------------------------------------------------------------
  console.log("--- Test Section 1: Pure Calculation & Algorithm Units ---");

  // 1a. Empty, undefined, null, whitespace
  assert(countWords("") === 0, "countWords('') returns 0");
  assert(countWords(null) === 0, "countWords(null) returns 0");
  assert(countWords(undefined) === 0, "countWords(undefined) returns 0");
  assert(countWords("   \n\t  ") === 0, "countWords whitespace returns 0");
  assert(calculateReadingTime("") === "1 min read", "calculateReadingTime('') returns minimum '1 min read'");
  assert(calculateReadingTime(null) === "1 min read", "calculateReadingTime(null) returns minimum '1 min read'");
  assert(calculateReadingTime(undefined) === "1 min read", "calculateReadingTime(undefined) returns minimum '1 min read'");
  assert(calculateReadingTime("   ") === "1 min read", "calculateReadingTime('   ') returns minimum '1 min read'");

  // 1b. HTML Tags Stripping & Non-Concatenation
  const htmlSample = "<h1>Title</h1><p>First paragraph.</p><p>Second paragraph with <b>bold</b> text.</p>";
  const htmlWords = countWords(htmlSample);
  assert(htmlWords === 8, `countWords parses HTML correctly (expected 8, got ${htmlWords})`);
  assert(calculateReadingTime(htmlSample) === "1 min read", "Short HTML returns '1 min read'");

  const emptyTagsHtml = "<div><p><br><span>  </span></p></div>";
  assert(countWords(emptyTagsHtml) === 0, "Empty tags HTML counts as 0 words");
  assert(calculateReadingTime(emptyTagsHtml) === "1 min read", "Empty tags HTML returns minimum '1 min read'");

  // 1c. Short Articles (< 200 words)
  const shortText = generateWords(45);
  assert(countWords(shortText) === 45, "Short text generated 45 words");
  assert(calculateReadingTime(shortText) === "1 min read", "45 words returns '1 min read'");

  // 1d. Exact 200 Words Threshold
  const exact200Text = generateWords(200);
  assert(countWords(exact200Text) === 200, "Exact 200 words generated");
  assert(calculateReadingTime(exact200Text) === "1 min read", "200 words returns '1 min read'");

  // 1e. 201 Words Increment Threshold
  const text201 = generateWords(201);
  assert(countWords(text201) === 201, "201 words generated");
  assert(calculateReadingTime(text201) === "2 min read", "201 words returns '2 min read'");

  // 1f. Medium Article (600 words)
  const mediumText = generateWords(600);
  assert(countWords(mediumText) === 600, "600 words generated");
  assert(calculateReadingTime(mediumText) === "3 min read", "600 words returns '3 min read'");

  // 1g. Long Article (2400 words HTML)
  const longHtml = generateHtmlWords(2400);
  const longCount = countWords(longHtml);
  assert(longCount === 2400, `2400 words generated in HTML (got ${longCount})`);
  assert(calculateReadingTime(longHtml) === "12 min read", "2400 words in HTML returns '12 min read'");

  // 1h. Frontend / Backend Calculation Parity
  console.log("\n--- Test Section 2: Frontend & Backend Consistency ---");
  const testCases = [
    "",
    "Hello world",
    htmlSample,
    shortText,
    exact200Text,
    text201,
    mediumText,
    longHtml,
    "<p>&nbsp; &amp; &lt;tag&gt; word1 word2 word3</p>",
  ];

  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i];
    const serverResult = calculateReadingTime(input);
    const clientResult = clientCalculateReadingTime(input);
    const serverWords = countWords(input);
    const clientWords = clientCountWords(input);
    assert(
      serverResult === clientResult && serverWords === clientWords,
      `Case ${i + 1}: Server ('${serverResult}', ${serverWords}w) matches Client ('${clientResult}', ${clientWords}w)`
    );
  }

  // -----------------------------------------------------------------
  // 3. MONGOOSE MODEL LIFECYCLE TESTS (Direct DB Verification)
  // -----------------------------------------------------------------
  console.log("\n--- Test Section 3: Mongoose Model Schema & Lifecycle Hooks ---");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for Model Lifecycle verification.");

  const rand = Date.now();
  const testUser = await User.create({
    name: `Test Author ${rand}`,
    email: `reading_author_${rand}@devstory.local`,
    password: "Password123!",
  });

  // 3a. Model auto-populates readTime on creation
  const docShort = new Article({
    title: `Reading Time Short ${rand}`,
    content: generateWords(80),
    author: testUser._id,
    category: "Technology",
  });
  await docShort.save();
  assert(docShort.readTime === "1 min read", `Model auto-calculates short article readTime: "${docShort.readTime}"`);

  const docMedium = new Article({
    title: `Reading Time Medium ${rand}`,
    content: generateWords(500),
    author: testUser._id,
    category: "Architecture",
  });
  await docMedium.save();
  assert(docMedium.readTime === "3 min read", `Model auto-calculates medium article readTime: "${docMedium.readTime}"`);

  // 3b. Model auto-recalculates readTime when content is modified
  docMedium.content = generateHtmlWords(1400);
  await docMedium.save();
  assert(docMedium.readTime === "7 min read", `Model automatically recalculates on content expansion: "${docMedium.readTime}"`);

  docMedium.content = "<p>Shortened back down to just five words here.</p>";
  await docMedium.save();
  assert(docMedium.readTime === "1 min read", `Model automatically recalculates on content shortening: "${docMedium.readTime}"`);

  // -----------------------------------------------------------------
  // 4. FULL API END-TO-END VERIFICATION (HTTP Endpoints)
  // -----------------------------------------------------------------
  console.log("\n--- Test Section 4: Full Stack REST API Endpoints ---");

  // Login / Auth token for API calls
  const token = testUser.generateAuthToken();

  // 4a. POST /api/articles (Create Article)
  const createRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: `API Reading Time Test Article ${rand}`,
      category: "Node.js",
      tags: ["Performance", "Testing"],
      content: generateHtmlWords(850), // 850 words -> 5 min read
      status: "published",
    }),
  });

  const createData = await createRes.json();
  assert(createRes.status === 201, "POST /api/articles returns 201 Created");
  assert(createData.success === true, "POST /api/articles returns success: true");
  assert(createData.article.readTime === "5 min read", `POST response includes auto-calculated readTime: "${createData.article.readTime}"`);

  const articleSlug = createData.article.slug;

  // 4b. GET /api/articles/:idOrSlug (Single Article Detail)
  const getOneRes = await fetch(`${API_BASE}/articles/${articleSlug}`);
  const getOneData = await getOneRes.json();
  assert(getOneRes.status === 200, "GET /api/articles/:slug returns 200 OK");
  assert(getOneData.article.readTime === "5 min read", `GET detail includes readTime: "${getOneData.article.readTime}"`);

  // 4c. PUT /api/articles/:idOrSlug (Edit Article Content)
  const editRes = await fetch(`${API_BASE}/articles/${articleSlug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content: generateHtmlWords(2100), // Updated to 2100 words -> 11 min read
    }),
  });

  const editData = await editRes.json();
  assert(editRes.status === 200, "PUT /api/articles/:slug returns 200 OK");
  assert(editData.article.readTime === "11 min read", `PUT response returns updated readTime: "${editData.article.readTime}"`);

  // 4d. GET /api/articles (Article Card List Feed)
  const listRes = await fetch(`${API_BASE}/articles?limit=10`);
  const listData = await listRes.json();
  assert(listRes.status === 200, "GET /api/articles returns 200 OK");
  const foundInList = listData.articles.find((a) => a.slug === articleSlug);
  assert(Boolean(foundInList), "Newly created article found in public articles feed");
  assert(foundInList.readTime === "11 min read", `Article in listing has correct readTime: "${foundInList.readTime}"`);

  // 4e. GET /api/articles/my-articles (Author Studio)
  const myRes = await fetch(`${API_BASE}/articles/my-articles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const myData = await myRes.json();
  assert(myRes.status === 200, "GET /api/articles/my-articles returns 200 OK");
  const foundInMy = myData.articles.find((a) => a.slug === articleSlug);
  assert(Boolean(foundInMy), "Article found in /my-articles");
  assert(foundInMy.readTime === "11 min read", `Article in /my-articles has correct readTime: "${foundInMy.readTime}"`);

  // -----------------------------------------------------------------
  // 5. CLEANUP
  // -----------------------------------------------------------------
  console.log("\n--- Cleaning up Test Artifacts ---");
  await Article.deleteMany({ author: testUser._id });
  await User.deleteOne({ _id: testUser._id });
  await mongoose.disconnect();
  console.log("Cleanup complete and disconnected from DB.");

  console.log("\n=================================================");
  console.log("🎉 ALL AUTOMATIC READING TIME TESTS PASSED (100%)");
  console.log("=================================================");
}

runReadingTimeTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
