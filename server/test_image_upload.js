import mongoose from "mongoose";
import dotenv from "dotenv";
import Article from "./models/Article.js";
import User from "./models/User.js";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runImageUploadTests() {
  console.log("=================================================");
  console.log("DEVSTORY - ARTICLE IMAGE UPLOAD TEST SUITE");
  console.log("=================================================");

  const timestamp = Date.now();
  let authorToken = "";
  let authorId = "";

  // 1. Setup author user
  const authorRes = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Upload Author ${timestamp}`,
      email: `upload.author.${timestamp}@example.com`,
      password: "Password123!",
    }),
  });
  const authorData = await authorRes.json();
  assert(authorRes.status === 201, "Author registered for image upload suite");
  authorToken = authorData.token;
  authorId = authorData.user.id || authorData.user._id;

  // --- Test 1: Valid Image Upload (PNG / JPEG) ---
  console.log("\n--- Test 1: Valid Image Upload ---");
  // 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64"
  );

  const formData1 = new FormData();
  const file1 = new Blob([samplePngBuffer], { type: "image/png" });
  formData1.append("image", file1, "sample_thumbnail.png");

  const uploadRes1 = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorToken}`,
    },
    body: formData1,
  });

  const uploadData1 = await uploadRes1.json();
  assert(uploadRes1.status === 200, "POST /api/upload returns 200 OK");
  assert(uploadData1.success === true, "Upload response has success: true");
  assert(typeof uploadData1.url === "string" && uploadData1.url.startsWith("http"), `Valid image URL returned: ${uploadData1.url}`);
  assert(typeof uploadData1.public_id === "string", `Unique storage identifier generated: ${uploadData1.public_id}`);

  // --- Test 2: Invalid File Type Rejection ---
  console.log("\n--- Test 2: Invalid File Type Rejection ---");
  const textBuffer = Buffer.from("This is plain text, not an image.", "utf8");
  const formData2 = new FormData();
  const file2 = new Blob([textBuffer], { type: "text/plain" });
  formData2.append("image", file2, "document.txt");

  const uploadRes2 = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorToken}`,
    },
    body: formData2,
  });
  const uploadData2 = await uploadRes2.json();
  assert(uploadRes2.status === 400, "Invalid file type (.txt) returns 400 Bad Request");
  assert(uploadData2.success === false, "Error message returned for invalid file type");

  // --- Test 3: Oversized File Rejection (>5MB) ---
  console.log("\n--- Test 3: Oversized File Rejection (>5MB) ---");
  const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024); // 5.5MB
  const formData3 = new FormData();
  const file3 = new Blob([oversizedBuffer], { type: "image/png" });
  formData3.append("image", file3, "oversized_image.png");

  const uploadRes3 = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorToken}`,
    },
    body: formData3,
  });
  const uploadData3 = await uploadRes3.json();
  assert(uploadRes3.status === 400, "Oversized file (>5MB) returns 400 Bad Request");
  assert(uploadData3.message.includes("large") || uploadData3.message.includes("5MB"), "File size limit message returned");

  // --- Test 4: Missing File in Request ---
  console.log("\n--- Test 4: Missing File in Request ---");
  const emptyFormData = new FormData();
  const uploadRes4 = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorToken}`,
    },
    body: emptyFormData,
  });
  assert(uploadRes4.status === 400, "Empty upload request returns 400 Bad Request");

  // --- Test 5: Unauthenticated Upload Rejection ---
  console.log("\n--- Test 5: Unauthenticated Upload Rejection ---");
  const uploadRes5 = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData1,
  });
  assert(uploadRes5.status === 401, "Unauthenticated upload request returns 401 Unauthorized");

  // --- Test 6: Create Article Referencing Uploaded Image URL ---
  console.log("\n--- Test 6: Create Article with Uploaded Thumbnail ---");
  const postRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Article with Custom Thumbnail ${timestamp}`,
      content: "<p>Article featuring a custom uploaded cloud thumbnail image.</p>",
      thumbnail: uploadData1.url,
      category: "Technology",
    }),
  });
  const postData = await postRes.json();
  assert(postRes.status === 201, "Article created with custom thumbnail (201 Created)");
  assert(postData.article.thumbnail === uploadData1.url, "Thumbnail URL accurately stored in MongoDB article document");

  // --- Test 7: Replace Image on Existing Article (Edit) ---
  console.log("\n--- Test 7: Replace Image during Article Edit ---");
  const sampleJpgBuffer = Buffer.from(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
    "base64"
  );
  const formDataReplacement = new FormData();
  const fileReplacement = new Blob([sampleJpgBuffer], { type: "image/jpeg" });
  formDataReplacement.append("image", fileReplacement, "replacement_banner.jpg");

  const uploadResRepl = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorToken}`,
    },
    body: formDataReplacement,
  });
  const uploadDataRepl = await uploadResRepl.json();
  assert(uploadResRepl.status === 200, "Replacement image uploaded successfully");

  const putRes = await fetch(`${API_BASE}/articles/${postData.article.slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      thumbnail: uploadDataRepl.url,
    }),
  });
  const putData = await putRes.json();
  assert(putRes.status === 200, "Article updated with replacement thumbnail (200 OK)");
  assert(putData.article.thumbnail === uploadDataRepl.url, "Updated thumbnail persisted in MongoDB");

  // --- Test 8: Article without Image Uses Safe Default ---
  console.log("\n--- Test 8: Article without Custom Image Defaults Safely ---");
  const noImgRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: `Article without Custom Image ${timestamp}`,
      content: "<p>Article relying on default featured thumbnail.</p>",
      category: "General",
    }),
  });
  const noImgData = await noImgRes.json();
  assert(noImgRes.status === 201, "Article created without custom thumbnail (201 Created)");
  assert(
    typeof noImgData.article.thumbnail === "string" && noImgData.article.thumbnail.length > 0,
    "Article schema supplies default thumbnail gracefully"
  );

  // --- Cleanup ---
  console.log("\n--- Cleaning up test fixtures ---");
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devstory";
  await mongoose.connect(mongoUri);
  await Article.deleteMany({
    _id: { $in: [postData.article._id, noImgData.article._id] },
  });
  await User.deleteOne({ _id: authorId });
  await mongoose.disconnect();
  console.log("Cleanup complete and disconnected from DB.");

  console.log("\n=================================================");
  console.log("🎉 ALL IMAGE UPLOAD TESTS PASSED (100%)");
  console.log("=================================================");
}

runImageUploadTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
