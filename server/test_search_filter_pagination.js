import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

import Article from "./models/Article.js";
import User from "./models/User.js";

import { connectDB } from "./config/db.js";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=================================================");
  console.log("🔍 DevStory Search, Filtering & Pagination Tests");
  console.log("=================================================");

  try {
    await connectDB();

    // 1. Setup a test author
    const testEmail = `test_author_filter_${Date.now()}@devstory.local`;
    const author = await User.create({
      name: "Search Tester",
      email: testEmail,
      password: "password123",
      role: "user",
    });

    const timestamp = Date.now();
    const uniqueTag = `run${timestamp}`;

    // 2. Create test articles across various categories and titles/excerpts
    // plus 1 draft article that must be strictly hidden from public queries
    const testArticlesData = [
      {
        title: `React Server Components Guide ${uniqueTag}`,
        excerpt: `A deep dive into hydration and streaming in React 19 ${uniqueTag}`,
        content: `Complete guide on React Server Components and Suspense boundaries.`,
        category: "React",
        status: "published",
        author: author._id,
      },
      {
        title: `Mastering Node.js Microservices ${uniqueTag}`,
        excerpt: `Designing scalable message queues with Redis and RabbitMQ ${uniqueTag}`,
        content: `Node.js clusters and event-driven architecture explained.`,
        category: "Node.js",
        status: "published",
        author: author._id,
      },
      {
        title: `MongoDB Indexing Strategies ${uniqueTag}`,
        excerpt: `Compound indexes and explain plans in MongoDB Atlas ${uniqueTag}`,
        content: `Optimizing query execution time and reducing document scanning.`,
        category: "Database",
        status: "published",
        author: author._id,
      },
      {
        title: `Clean Architecture in Modern Web Apps ${uniqueTag}`,
        excerpt: `Structuring domain entities and repository patterns in Node.js ${uniqueTag}`,
        content: `Hexagonal architecture applied to full-stack TypeScript applications.`,
        category: "Architecture",
        status: "published",
        author: author._id,
      },
      {
        title: `Advanced State Management ${uniqueTag}`,
        excerpt: `Exploring useActionState and Server Actions in modern apps ${uniqueTag}`,
        content: `How actions simplify asynchronous state mutations in client apps.`,
        category: "React",
        status: "published",
        author: author._id,
      },
      {
        title: `Draft Secret React Innovations ${uniqueTag}`,
        excerpt: `Unpublished draft testing search isolation for React ${uniqueTag}`,
        content: `This draft should NEVER show up in public search or category filters!`,
        category: "React",
        status: "draft", // DRAFT: Must be hidden from public API
        author: author._id,
      },
    ];

    const createdArticles = [];
    for (const item of testArticlesData) {
      const art = new Article(item);
      await art.save();
      createdArticles.push(art);
    }
    console.log(`Created and saved ${createdArticles.length} test articles for search & filter verification.`);

    let passedTests = 0;
    let totalTests = 0;

    const assert = (condition, description) => {
      totalTests++;
      if (condition) {
        console.log(`  ✓ [PASS] ${description}`);
        passedTests++;
      } else {
        console.error(`  ✗ [FAIL] ${description}`);
      }
    };

    // --- TEST SUITE ---

    // 1. Search by Title
    console.log("\n--- Testing Search Functionality ---");
    {
      const res = await fetch(`${BASE_URL}/articles?search=${encodeURIComponent(`MongoDB Indexing Strategies ${uniqueTag}`)}`);
      const data = await res.json();
      assert(res.status === 200, "Search by title returns 200 OK");
      assert(data.success === true, "Response has success: true");
      assert(data.articles.length === 1, "Finds exact title match");
      assert(data.articles[0] && data.articles[0].title.includes("MongoDB Indexing Strategies"), "Correct article returned for title search");
    }

    // 2. Search by Excerpt
    {
      const res = await fetch(`${BASE_URL}/articles?search=${encodeURIComponent(`hydration and streaming in React 19 ${uniqueTag}`)}`);
      const data = await res.json();
      assert(res.status === 200, "Search by excerpt returns 200 OK");
      assert(data.articles.length === 1, "Finds article matching excerpt");
      assert(data.articles[0] && data.articles[0].category === "React", "Found article has correct category");
    }

    // 3. Search by Content
    {
      const res = await fetch(`${BASE_URL}/articles?search=${encodeURIComponent("Hexagonal architecture")}`);
      const data = await res.json();
      assert(res.status === 200, "Search by content returns 200 OK");
      assert(data.articles.some((a) => a.title.includes("Clean Architecture")), "Finds article matching content");
    }

    // 4. Draft Isolation in Search (CRITICAL REQUIREMENT)
    {
      const res = await fetch(`${BASE_URL}/articles?search=${encodeURIComponent(`Draft Secret React Innovations ${uniqueTag}`)}`);
      const data = await res.json();
      assert(res.status === 200, "Draft search query returns 200 OK");
      assert(data.articles.length === 0, "Draft article is NOT returned in public search results");
    }

    // 5. Category Filtering
    console.log("\n--- Testing Category Filtering ---");
    {
      const res = await fetch(`${BASE_URL}/articles?category=React&search=${uniqueTag}`);
      const data = await res.json();
      assert(res.status === 200, "Category filter returns 200 OK");
      // Among the test articles tagged with uniqueTag, there are 2 published React articles and 1 draft
      assert(data.articles.length === 2, "Returns only published articles for category 'React'");
      assert(data.articles.every((a) => a.category === "React"), "All returned articles belong to category 'React'");
      assert(data.articles.every((a) => a.status === "published"), "All returned articles are published");
    }

    // 6. Category "All" returns all categories
    {
      const res = await fetch(`${BASE_URL}/articles?category=All&search=${uniqueTag}`);
      const data = await res.json();
      assert(res.status === 200, "Category=All returns 200 OK");
      assert(data.articles.length === 5, "Returns all 5 published test articles across all categories");
    }

    // 7. Combined Search and Category Filtering
    console.log("\n--- Testing Combined Search & Category Filter ---");
    {
      // Search "Advanced State Management" in category "React"
      const res = await fetch(`${BASE_URL}/articles?category=React&search=${encodeURIComponent(`Advanced State Management ${uniqueTag}`)}`);
      const data = await res.json();
      assert(res.status === 200, "Combined filter returns 200 OK");
      assert(data.articles.length === 1, "Returns exactly 1 article matching both category and search query");
      assert(data.articles[0] && data.articles[0].title.includes("Advanced State Management"), "Matched expected article title");
    }

    // 8. Combined Search and Category with 0 matches (Empty State)
    {
      // Search "MongoDB" in category "React"
      const res = await fetch(`${BASE_URL}/articles?category=React&search=${encodeURIComponent(`MongoDB ${uniqueTag}`)}`);
      const data = await res.json();
      assert(res.status === 200, "Non-matching combined query returns 200 OK");
      assert(data.articles.length === 0, "Returns empty articles array when criteria do not overlap");
      assert(data.total === 0, "Total count is 0 for empty search/filter");
    }

    // 9. Pagination Tests
    console.log("\n--- Testing Pagination Functionality ---");
    {
      // Fetch page 1 with limit 2 (scoped to uniqueTag)
      const resPage1 = await fetch(`${BASE_URL}/articles?search=${uniqueTag}&page=1&limit=2`);
      const dataPage1 = await resPage1.json();

      assert(resPage1.status === 200, "Pagination Page 1 returns 200 OK");
      assert(dataPage1.page === 1, "Page number is 1");
      assert(dataPage1.limit === 2, "Limit is 2");
      assert(dataPage1.total === 5, "Total matches count is 5");
      assert(dataPage1.totalPages === 3, "Total pages is 3 (ceil(5/2))");
      assert(dataPage1.hasNextPage === true, "hasNextPage is true on page 1");
      assert(dataPage1.hasPrevPage === false, "hasPrevPage is false on page 1");
      assert(dataPage1.articles.length === 2, "Returns exactly 2 articles on page 1");

      const firstArticleId = dataPage1.articles[0]._id;

      // Fetch page 2 with limit 2
      const resPage2 = await fetch(`${BASE_URL}/articles?search=${uniqueTag}&page=2&limit=2`);
      const dataPage2 = await resPage2.json();

      assert(resPage2.status === 200, "Pagination Page 2 returns 200 OK");
      assert(dataPage2.page === 2, "Page number is 2");
      assert(dataPage2.hasNextPage === true, "hasNextPage is true on page 2");
      assert(dataPage2.hasPrevPage === true, "hasPrevPage is true on page 2");
      assert(dataPage2.articles.length === 2, "Returns exactly 2 articles on page 2");
      assert(dataPage2.articles[0]._id !== firstArticleId, "Page 2 articles are distinct from Page 1");

      // Fetch page 3 with limit 2 (last page)
      const resPage3 = await fetch(`${BASE_URL}/articles?search=${uniqueTag}&page=3&limit=2`);
      const dataPage3 = await resPage3.json();

      assert(resPage3.status === 200, "Pagination Page 3 returns 200 OK");
      assert(dataPage3.page === 3, "Page number is 3");
      assert(dataPage3.hasNextPage === false, "hasNextPage is false on last page");
      assert(dataPage3.hasPrevPage === true, "hasPrevPage is true on last page");
      assert(dataPage3.articles.length === 1, "Returns remaining 1 article on page 3");

      // Fetch page 4 with limit 2 (out of bounds)
      const resPage4 = await fetch(`${BASE_URL}/articles?search=${uniqueTag}&page=4&limit=2`);
      const dataPage4 = await resPage4.json();
      assert(resPage4.status === 200, "Out of bounds page returns 200 OK");
      assert(dataPage4.articles.length === 0, "Returns empty articles array for out of bounds page");
      assert(dataPage4.hasNextPage === false, "hasNextPage is false for out of bounds page");
    }

    // Clean up test data
    console.log("\n--- Cleaning Up Test Data ---");
    await Article.deleteMany({ author: author._id });
    await User.findByIdAndDelete(author._id);
    console.log("Test data cleaned up successfully.");

    console.log("\n=================================================");
    console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log("=================================================");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
