import { generateShareLinks, copyToClipboard } from "../client/src/utils/socialShare.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runSocialShareTests() {
  console.log("=================================================");
  console.log("DEVSTORY - SOCIAL SHARING FEATURE TEST SUITE");
  console.log("=================================================");

  const sampleArticle = {
    _id: "60c72b2f9b1d8b0015b6d111",
    title: "Mastering Distributed Caching with Redis & Kafka",
    excerpt: "An architectural deep-dive into caching layers for real-time systems.",
    slug: "mastering-distributed-caching-with-redis-and-kafka",
    tags: ["Redis", "Kafka", "Architecture", "Node.js"],
    status: "published",
  };

  const sampleUrl = `https://devstory.blog/articles/${sampleArticle.slug}`;

  // --- Test 1: Dynamic Share Link Generation ---
  console.log("\n--- Test 1: Dynamic Share Link Generation ---");
  const links = generateShareLinks(sampleArticle, sampleUrl);

  assert(typeof links === "object", "generateShareLinks returns an object");
  assert(typeof links.whatsapp === "string", "whatsapp link generated");
  assert(typeof links.linkedin === "string", "linkedin link generated");
  assert(typeof links.x === "string", "x link generated");
  assert(typeof links.twitter === "string", "twitter link generated");
  assert(typeof links.facebook === "string", "facebook link generated");
  assert(typeof links.reddit === "string", "reddit link generated");

  // --- Test 2: WhatsApp Share Content ---
  console.log("\n--- Test 2: WhatsApp Share Content ---");
  const decodedWhatsApp = decodeURIComponent(links.whatsapp);
  assert(
    links.whatsapp.startsWith("https://api.whatsapp.com/send?text="),
    "WhatsApp URL uses standard api.whatsapp.com/send endpoint"
  );
  assert(
    decodedWhatsApp.includes(sampleArticle.title),
    "WhatsApp share text includes article title"
  );
  assert(
    decodedWhatsApp.includes(sampleUrl),
    "WhatsApp share text includes dynamic article URL"
  );

  // --- Test 3: LinkedIn Share Content ---
  console.log("\n--- Test 3: LinkedIn Share Content ---");
  assert(
    links.linkedin === `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sampleUrl)}`,
    "LinkedIn URL uses standard share-offsite endpoint with encoded URL"
  );

  // --- Test 4: X / Twitter Share Content ---
  console.log("\n--- Test 4: X / Twitter Share Content ---");
  assert(
    links.x.startsWith("https://x.com/intent/tweet?"),
    "X URL uses official x.com/intent/tweet endpoint"
  );
  assert(
    links.x.includes(encodeURIComponent(sampleArticle.title)),
    "X share intent includes article title"
  );
  assert(
    links.x.includes(encodeURIComponent(sampleUrl)),
    "X share intent includes dynamic article URL"
  );
  assert(
    links.x.includes("hashtags=Redis%2CKafka%2CArchitecture%2CNodejs"),
    "X share intent sanitizes and encodes hashtags"
  );

  // --- Test 5: Fallback When Metadata Missing ---
  console.log("\n--- Test 5: Safe Fallbacks for Sparse Metadata ---");
  const sparseArticle = {
    slug: "simple-post",
  };
  const sparseLinks = generateShareLinks(sparseArticle, "https://devstory.blog/articles/simple-post");
  assert(
    sparseLinks.whatsapp.includes("DevStory%20Article"),
    "WhatsApp falls back to default title safely"
  );
  assert(
    sparseLinks.linkedin.includes("https%3A%2F%2Fdevstory.blog%2Farticles%2Fsimple-post"),
    "LinkedIn handles sparse article URL safely"
  );
  assert(
    sparseLinks.x.includes("DevStory%20Article"),
    "X falls back to default title safely"
  );

  // --- Test 6: Clipboard Helper Behavior ---
  console.log("\n--- Test 6: Clipboard Helper Behavior ---");
  // In Node environment without DOM, copyToClipboard should fail gracefully
  let threwError = false;
  try {
    await copyToClipboard("https://devstory.blog/articles/test");
  } catch (e) {
    threwError = true;
    assert(
      e.message.includes("Clipboard") || e.message.includes("unavailable"),
      "copyToClipboard handles non-browser environment gracefully"
    );
  }
  assert(threwError, "copyToClipboard correctly throws error when no clipboard or DOM is available");

  // Verify empty string rejection
  let emptyRejected = false;
  try {
    await copyToClipboard("");
  } catch (e) {
    emptyRejected = true;
    assert(e.message === "No text to copy", "copyToClipboard rejects empty input");
  }
  assert(emptyRejected, "Empty clipboard copy properly rejected");

  console.log("\n=================================================");
  console.log("🎉 ALL SOCIAL SHARING TESTS PASSED (100%)");
  console.log("=================================================");
}

runSocialShareTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
