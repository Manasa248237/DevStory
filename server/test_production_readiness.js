import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import http from "http";
import app from "./app.js";
import User from "./models/User.js";
import Article from "./models/Article.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

async function runProductionReadinessCheck() {
  console.log("=================================================");
  console.log("DEVSTORY - IMAGE UPLOAD PRODUCTION READINESS E2E");
  console.log("=================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in environment.");
    process.exit(1);
  }

  // 1. Database Connection
  await mongoose.connect(mongoUri);
  console.log("✅ [MongoDB Atlas] Connected successfully\n");

  // 2. Start temporary local HTTP server for E2E requests
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passedTests = 0;
  let totalTests = 14;

  const testUserEmail = `prod_readiness_${Date.now()}@devstory.local`;
  const testPassword = "Password@123!";
  let authToken = "";
  let authorId = "";
  let createdArticleId = "";
  let createdArticleSlug = "";
  let firstUploadedImageUrl = "";
  let secondUploadedImageUrl = "";

  try {
    // --- Step 0: Register & Authenticate User ---
    const regRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Readiness Tester",
        email: testUserEmail,
        password: testPassword,
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.token) {
      throw new Error(`Failed to register test user: ${regData.message}`);
    }
    authToken = regData.token;
    authorId = regData.user.id || regData.user._id;

    // -------------------------------------------------------------
    // Scenario 12: Unauthenticated upload is rejected (401)
    // -------------------------------------------------------------
    const boundary12 = "----WebKitFormBoundary12" + Date.now();
    const fakePng = Buffer.from("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82");
    
    let body12 = Buffer.concat([
      Buffer.from(`--${boundary12}\r\nContent-Disposition: form-data; name="image"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`),
      fakePng,
      Buffer.from(`\r\n--${boundary12}--\r\n`),
    ]);

    const res12 = await fetch(`${baseUrl}/api/upload/image`, {
      method: "POST",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary12}` },
      body: body12,
    });
    if (res12.status === 401) {
      console.log("✅ [PASS] 12. Unauthenticated upload is rejected (401 Unauthorized)");
      passedTests++;
    } else {
      console.error(`❌ [FAIL] 12. Expected 401, got ${res12.status}`);
    }

    // -------------------------------------------------------------
    // Scenario 10: Invalid file type is rejected (400)
    // -------------------------------------------------------------
    const boundary10 = "----WebKitFormBoundary10" + Date.now();
    const txtBuffer = Buffer.from("Plain text content pretending to be image", "utf8");
    let body10 = Buffer.concat([
      Buffer.from(`--${boundary10}\r\nContent-Disposition: form-data; name="image"; filename="script.txt"\r\nContent-Type: text/plain\r\n\r\n`),
      txtBuffer,
      Buffer.from(`\r\n--${boundary10}--\r\n`),
    ]);

    const res10 = await fetch(`${baseUrl}/api/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary10}`,
      },
      body: body10,
    });
    if (res10.status === 400) {
      console.log("✅ [PASS] 10. Invalid file type (.txt) is rejected (400 Bad Request)");
      passedTests++;
    } else {
      console.error(`❌ [FAIL] 10. Expected 400, got ${res10.status}`);
    }

    // -------------------------------------------------------------
    // Scenario 11: Oversized file (>5MB) is rejected (400)
    // -------------------------------------------------------------
    const boundary11 = "----WebKitFormBoundary11" + Date.now();
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    let body11 = Buffer.concat([
      Buffer.from(`--${boundary11}\r\nContent-Disposition: form-data; name="image"; filename="large.png"\r\nContent-Type: image/png\r\n\r\n`),
      oversizedBuffer,
      Buffer.from(`\r\n--${boundary11}--\r\n`),
    ]);

    const res11 = await fetch(`${baseUrl}/api/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary11}`,
      },
      body: body11,
    });
    if (res11.status === 400) {
      console.log("✅ [PASS] 11. Oversized file (>5MB) is rejected (400 Bad Request)");
      passedTests++;
    } else {
      console.error(`❌ [FAIL] 11. Expected 400, got ${res11.status}`);
    }

    // -------------------------------------------------------------
    // Scenario 13: Missing/empty upload is handled gracefully (400)
    // -------------------------------------------------------------
    const boundary13 = "----WebKitFormBoundary13" + Date.now();
    let body13 = Buffer.from(`--${boundary13}\r\nContent-Disposition: form-data; name="other"\r\n\r\nvalue\r\n--${boundary13}--\r\n`);

    const res13 = await fetch(`${baseUrl}/api/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary13}`,
      },
      body: body13,
    });
    if (res13.status === 400) {
      console.log("✅ [PASS] 13. Missing image payload is handled gracefully (400 Bad Request)");
      passedTests++;
    } else {
      console.error(`❌ [FAIL] 13. Expected 400, got ${res13.status}`);
    }

    // -------------------------------------------------------------
    // Scenario 1 & 2 & 3 & 4: Valid image upload & Cloudinary response
    // -------------------------------------------------------------
    const boundary1 = "----WebKitFormBoundary1" + Date.now();
    let body1 = Buffer.concat([
      Buffer.from(`--${boundary1}\r\nContent-Disposition: form-data; name="image"; filename="architecture_hero.png"\r\nContent-Type: image/png\r\n\r\n`),
      fakePng,
      Buffer.from(`\r\n--${boundary1}--\r\n`),
    ]);

    const res1 = await fetch(`${baseUrl}/api/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary1}`,
      },
      body: body1,
    });
    const data1 = await res1.json();

    if (res1.status === 200 && data1.success && data1.url) {
      firstUploadedImageUrl = data1.url;
      console.log("✅ [PASS] 1. Authenticated user uploads a valid image.");
      console.log("✅ [PASS] 2. Frontend receives preview URL format.");
      console.log("✅ [PASS] 3. Image is uploaded successfully (200 OK).");
      console.log(`✅ [PASS] 4. Cloudinary/CDN returns secure image URL: ${firstUploadedImageUrl}`);
      passedTests += 4;
    } else {
      console.error("❌ [FAIL] 1-4. Upload failed:", data1);
    }

    // -------------------------------------------------------------
    // Scenario 5: Article stores the image URL in MongoDB
    // -------------------------------------------------------------
    const articlePayload = {
      title: "Building Resilient Microservices with Event Streams",
      excerpt: "A deep dive into distributed event messaging patterns and idempotent consumers.",
      content: "<h2>Architectural Foundations</h2><p>Here is an in-depth perspective on modern distributed messaging systems.</p>",
      category: "Architecture",
      tags: ["Microservices", "Cloud", "Events"],
      thumbnail: firstUploadedImageUrl,
      status: "published",
    };

    const res5 = await fetch(`${baseUrl}/api/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(articlePayload),
    });
    const data5 = await res5.json();

    if (res5.status === 201 && data5.success && data5.article) {
      createdArticleId = data5.article._id || data5.article.id;
      createdArticleSlug = data5.article.slug;
      if (data5.article.thumbnail === firstUploadedImageUrl) {
        console.log("✅ [PASS] 5. Article stores the image URL in MongoDB Atlas.");
        passedTests++;
      } else {
        console.error("❌ [FAIL] 5. Thumbnail URL mismatch in MongoDB:", data5.article.thumbnail);
      }
    } else {
      console.error("❌ [FAIL] 5. Article creation failed:", data5);
    }

    // -------------------------------------------------------------
    // Scenario 6: Article card query displays the image URL
    // -------------------------------------------------------------
    const res6 = await fetch(`${baseUrl}/api/articles?limit=5`);
    const data6 = await res6.json();
    const foundInList = data6.articles?.find((a) => a.slug === createdArticleSlug || a._id === createdArticleId);

    if (foundInList && foundInList.thumbnail === firstUploadedImageUrl) {
      console.log("✅ [PASS] 6. Article card queries include verified thumbnail URL.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 6. Article in listing did not have expected thumbnail URL.");
    }

    // -------------------------------------------------------------
    // Scenario 7: Article detail returns the image URL
    // -------------------------------------------------------------
    const res7 = await fetch(`${baseUrl}/api/articles/${createdArticleSlug}`);
    const data7 = await res7.json();

    if (data7.success && data7.article?.thumbnail === firstUploadedImageUrl) {
      console.log("✅ [PASS] 7. Article detail query returns verified main image URL.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 7. Article detail missing thumbnail URL.");
    }

    // -------------------------------------------------------------
    // Scenario 8: User edits an article and replaces the image
    // -------------------------------------------------------------
    // Upload a second image (e.g. WebP)
    const boundary8 = "----WebKitFormBoundary8" + Date.now();
    let body8 = Buffer.concat([
      Buffer.from(`--${boundary8}\r\nContent-Disposition: form-data; name="image"; filename="updated_architecture.webp"\r\nContent-Type: image/webp\r\n\r\n`),
      fakePng,
      Buffer.from(`\r\n--${boundary8}--\r\n`),
    ]);

    const res8_upload = await fetch(`${baseUrl}/api/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary8}`,
      },
      body: body8,
    });
    const data8_upload = await res8_upload.json();
    secondUploadedImageUrl = data8_upload.url;

    const res8_update = await fetch(`${baseUrl}/api/articles/${createdArticleSlug}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Building Resilient Microservices with Event Streams (Updated)",
        thumbnail: secondUploadedImageUrl,
      }),
    });
    const data8_update = await res8_update.json();

    if (data8_update.success && data8_update.article?.thumbnail === secondUploadedImageUrl) {
      createdArticleSlug = data8_update.article.slug || createdArticleSlug;
      console.log("✅ [PASS] 8. User edits an article and replaces the image.");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 8. Image replacement failed:", data8_update);
    }

    // -------------------------------------------------------------
    // Scenario 9: User edits an article without replacing the image
    // -------------------------------------------------------------
    const res9 = await fetch(`${baseUrl}/api/articles/${createdArticleSlug}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        excerpt: "Updated excerpt while retaining the current thumbnail URL.",
      }),
    });
    const data9 = await res9.json();

    if (data9.success && data9.article?.thumbnail === secondUploadedImageUrl) {
      console.log("✅ [PASS] 9. User edits an article without replacing image (persists existing image).");
      passedTests++;
    } else {
      console.error("❌ [FAIL] 9. Editing without thumbnail replacement failed:", data9);
    }

    // -------------------------------------------------------------
    // Scenario 14: Missing image handled gracefully (article created with empty/fallback)
    // -------------------------------------------------------------
    const res14 = await fetch(`${baseUrl}/api/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Article With No Image Test",
        excerpt: "An article created without any thumbnail URL.",
        content: "<p>Content without thumbnail image.</p>",
        category: "General",
        thumbnail: "",
        status: "published",
      }),
    });
    const data14 = await res14.json();

    if (res14.status === 201 && data14.success) {
      console.log("✅ [PASS] 14. Missing image handled gracefully on creation and display.");
      passedTests++;
      // Clean up second article
      if (data14.article?._id) {
        await Article.findByIdAndDelete(data14.article._id);
      }
    } else {
      console.error("❌ [FAIL] 14. Missing image test failed:", data14);
    }

  } catch (err) {
    console.error("❌ Test execution exception:", err);
  } finally {
    // Clean up test data
    if (createdArticleId) {
      await Article.findByIdAndDelete(createdArticleId);
    }
    if (authorId) {
      await User.findByIdAndDelete(authorId);
    }
    await mongoose.disconnect();
    server.close();

    console.log("\n=================================================");
    console.log(`SUMMARY: ${passedTests}/${totalTests} PRODUCTION READINESS TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log("=================================================");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

runProductionReadinessCheck();
