import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Article from "./models/Article.js";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

async function runUploadApiTests() {
  console.log("=================================================");
  console.log("DEVSTORY - BACKEND IMAGE UPLOAD API TEST SUITE");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const testEmail = `upload_tester_${timestamp}@devstory.local`;
  const password = "Password123!";

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ [MongoDB Atlas] Connected successfully\n");

    // 1. Register test user to obtain JWT
    const registerRes = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Upload Tester",
        email: testEmail,
        password,
      }),
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok || !registerData.token) {
      throw new Error(`Failed to create test user: ${JSON.stringify(registerData)}`);
    }
    const token = registerData.token;
    console.log("✅ [PASS] 1. Test user authenticated and JWT token generated");

    // 2. Test Unauthorized Upload Rejection (401)
    const unauthForm = new FormData();
    const fakeImageBlob = new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])], {
      type: "image/jpeg",
    });
    unauthForm.append("image", fakeImageBlob, "test.jpg");

    const unauthRes = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: unauthForm,
    });
    if (unauthRes.status === 401) {
      console.log("✅ [PASS] 2. Unauthorized upload request rejected with 401 Unauthorized");
    } else {
      throw new Error(`Expected 401 for unauthorized upload, got ${unauthRes.status}`);
    }

    // 3. Test Missing File Rejection (400)
    const emptyForm = new FormData();
    const missingFileRes = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: emptyForm,
    });
    const missingFileData = await missingFileRes.json();
    if (missingFileRes.status === 400 && missingFileData.success === false) {
      console.log("✅ [PASS] 3. Missing file submission rejected with 400 Bad Request");
    } else {
      throw new Error(`Expected 400 for missing file, got ${missingFileRes.status}`);
    }

    // 4. Test Invalid File Type Rejection (e.g. .pdf or .txt) (400)
    const invalidForm = new FormData();
    const textBlob = new Blob(["This is a text document, not an image"], { type: "text/plain" });
    invalidForm.append("image", textBlob, "document.txt");

    const invalidTypeRes = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: invalidForm,
    });
    const invalidTypeData = await invalidTypeRes.json();
    if (invalidTypeRes.status === 400 && invalidTypeData.message.includes("Invalid file type")) {
      console.log("✅ [PASS] 4. Invalid file MIME/extension (.txt) rejected with 400 Bad Request");
    } else {
      throw new Error(`Expected 400 for invalid file type, got ${invalidTypeRes.status}: ${JSON.stringify(invalidTypeData)}`);
    }

    // 5. Test Oversized File Rejection (> 5MB) (400)
    const oversizedForm = new FormData();
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const oversizedBlob = new Blob([oversizedBuffer], { type: "image/jpeg" });
    oversizedForm.append("image", oversizedBlob, "large.jpg");

    const oversizedRes = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: oversizedForm,
    });
    const oversizedData = await oversizedRes.json();
    if (oversizedRes.status === 400 && oversizedData.message.includes("File too large")) {
      console.log("✅ [PASS] 5. Oversized file (>5MB) rejected with 400 Bad Request");
    } else {
      throw new Error(`Expected 400 for oversized file, got ${oversizedRes.status}: ${JSON.stringify(oversizedData)}`);
    }

    // 6. Test Successful Valid Image Upload (JPEG / PNG / WebP)
    const validForm = new FormData();
    // Valid minimal JPEG header buffer
    const jpegBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0xff, 0xda,
      0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x00, 0xff, 0xd9
    ]);
    const validImageBlob = new Blob([jpegBuffer], { type: "image/jpeg" });
    validForm.append("image", validImageBlob, "hero-architecture.jpg");

    const uploadRes = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: validForm,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.url) {
      throw new Error(`Valid upload failed: ${JSON.stringify(uploadData)}`);
    }
    console.log(`✅ [PASS] 6. Valid image uploaded successfully (200 OK)`);
    console.log(`   - Secure URL returned: ${uploadData.url}`);
    console.log(`   - Public ID: ${uploadData.public_id}`);

    // 7. Test Article Integration with Uploaded Image URL
    const articleRes = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `Article with Uploaded Image ${timestamp}`,
        thumbnail: uploadData.url,
        content: "<p>Article content with uploaded featured image thumbnail.</p>",
        category: "Technology",
      }),
    });
    const articleData = await articleRes.json();
    if (!articleRes.ok || !articleData.article) {
      throw new Error(`Failed to create article with uploaded thumbnail: ${JSON.stringify(articleData)}`);
    }
    const createdArticle = articleData.article;
    if (createdArticle.thumbnail === uploadData.url) {
      console.log(`✅ [PASS] 7. Article created and stored with uploaded thumbnail URL in MongoDB Atlas`);
    } else {
      throw new Error(`Article thumbnail mismatch: expected ${uploadData.url}, got ${createdArticle.thumbnail}`);
    }

    // Cleanup test article and user
    await Article.deleteOne({ _id: createdArticle._id });
    await User.deleteOne({ email: testEmail });
    console.log("\n🧹 Test resources cleaned up successfully.");

    console.log("\n=================================================");
    console.log("SUMMARY: ALL 7 UPLOAD & INTEGRATION TESTS PASSED!");
    console.log("=================================================");
  } catch (error) {
    console.error("❌ Upload test failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runUploadApiTests();
