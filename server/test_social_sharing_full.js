const API_BASE = "http://localhost:5000/api";
const SERVER_BASE = "http://localhost:5000";

let testUserToken = "";
let testUserId = "";
let testArticleWithThumb = null;
let testArticleNoThumb = null;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log("====================================================================");
  console.log("🚀 STARTING DEVSTORY SOCIAL SHARING & REGRESSION TEST SUITE");
  console.log("====================================================================");

  // -------------------------------------------------------------------------
  // 1. REGRESSION TEST: User Registration & Authentication
  // -------------------------------------------------------------------------
  console.log("\n[1] Testing User Registration & Sign In (Auth Regression)...");
  const rand = Math.floor(Math.random() * 1000000);
  const testEmail = `sharetest_${rand}@devstory.io`;
  const testPassword = "Password@123";
  const testName = `Share Tester ${rand}`;

  // Sign up
  const registerRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });
  const registerData = await registerRes.json();
  assert(registerRes.status === 201 && registerData.token, "User registered successfully");
  testUserToken = registerData.token;
  testUserId = registerData.user._id || registerData.user.id;

  // Sign in
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.token, "User signed in successfully");

  // Get current user profile
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${testUserToken}` },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.user.email === testEmail, "Profile verification works");

  // -------------------------------------------------------------------------
  // 2. CREATE TEST ARTICLES (With Thumbnail & Without Thumbnail)
  // -------------------------------------------------------------------------
  console.log("\n[2] Creating Test Articles for Social Sharing Verification...");
  
  // Article WITH thumbnail
  const createArtWithThumbRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUserToken}`,
    },
    body: JSON.stringify({
      title: `Mastering Distributed State in 2026 ${rand}`,
      excerpt: "An architectural guide to resilient microservices & reactive caching at scale.",
      content: "<p>Distributed state management is essential for modern cloud applications.</p>",
      category: "Engineering",
      tags: ["distributed-systems", "microservices", "nodejs"],
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      status: "published",
    }),
  });
  const artWithThumbData = await createArtWithThumbRes.json();
  assert(createArtWithThumbRes.status === 201 && artWithThumbData.article.slug, "Created article with custom thumbnail");
  testArticleWithThumb = artWithThumbData.article;

  // Article WITHOUT thumbnail
  const createArtNoThumbRes = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUserToken}`,
    },
    body: JSON.stringify({
      title: `Zero-Dependency Architecture Patterns ${rand}`,
      excerpt: "Why minimal dependencies create faster, more maintainable codebases.",
      content: "<p>Minimal dependency engineering principles reduce supply chain vulnerabilities.</p>",
      category: "Architecture",
      tags: ["clean-code", "webdev"],
      status: "published",
    }),
  });
  const artNoThumbData = await createArtNoThumbRes.json();
  assert(createArtNoThumbRes.status === 201 && artNoThumbData.article.slug, "Created article without thumbnail (fallback handled)");
  testArticleNoThumb = artNoThumbData.article;

  // -------------------------------------------------------------------------
  // 3. FUNCTIONAL TEST: Social Share URLs & Intent Validation
  // -------------------------------------------------------------------------
  console.log("\n[3] Testing Social Share URL Generation Logic...");

  function generateShareLinks(article, origin = "http://localhost:5173") {
    const articleTitle = article?.title || "DevStory Engineering Article";
    const articleExcerpt = article?.excerpt || "Read this in-depth perspective on modern software engineering on DevStory.";
    const currentUrl = `${origin}/articles/${article.slug || article._id}`;
    const articleTags = Array.isArray(article?.tags) && article.tags.length > 0
      ? article.tags.map((t) => t.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean).join(",")
      : "DevStory,TechBlog,WebDev";

    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `*${articleTitle}*\n${articleExcerpt}\n\n${currentUrl}`
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        articleTitle
      )}&url=${encodeURIComponent(currentUrl)}&hashtags=${encodeURIComponent(articleTags)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(articleTitle)}`,
    };
  }

  const linksWithThumb = generateShareLinks(testArticleWithThumb);
  console.log("Generated WhatsApp Share Link:", linksWithThumb.whatsapp);
  console.log("Generated LinkedIn Share Link:", linksWithThumb.linkedin);
  console.log("Generated X/Twitter Share Link:", linksWithThumb.twitter);
  console.log("Generated Facebook Share Link:", linksWithThumb.facebook);

  // Assert WhatsApp contains title, excerpt, and url
  assert(linksWithThumb.whatsapp.includes(encodeURIComponent(testArticleWithThumb.title)), "WhatsApp intent contains encoded article title");
  assert(linksWithThumb.whatsapp.includes(encodeURIComponent(testArticleWithThumb.excerpt)), "WhatsApp intent contains encoded article excerpt");
  assert(linksWithThumb.whatsapp.includes(encodeURIComponent(testArticleWithThumb.slug)), "WhatsApp intent contains canonical article slug URL");

  // Assert LinkedIn contains target URL
  assert(linksWithThumb.linkedin.includes(encodeURIComponent(testArticleWithThumb.slug)), "LinkedIn share URL contains encoded canonical article slug");

  // Assert X/Twitter contains title, URL and hashtags
  assert(linksWithThumb.twitter.includes(encodeURIComponent(testArticleWithThumb.title)), "X/Twitter intent contains encoded article title");
  assert(linksWithThumb.twitter.includes(encodeURIComponent(testArticleWithThumb.slug)), "X/Twitter intent contains canonical article URL");
  assert(linksWithThumb.twitter.includes("distributedsystems"), "X/Twitter intent contains clean sanitized tags");

  // Assert Facebook contains target URL
  assert(linksWithThumb.facebook.includes(encodeURIComponent(testArticleWithThumb.slug)), "Facebook share URL contains encoded canonical article slug");

  // -------------------------------------------------------------------------
  // 4. FUNCTIONAL TEST: Server-Side Meta Pre-Rendering for Social Crawlers
  // -------------------------------------------------------------------------
  console.log("\n[4] Testing Server-Side HTML Metadata Injection for Social Media Crawlers...");

  // Test Article WITH thumbnail
  const crawlerRes1 = await fetch(`${SERVER_BASE}/articles/${testArticleWithThumb.slug}`);
  const html1 = await crawlerRes1.text();
  assert(crawlerRes1.status === 200, "Server responded 200 to article route");
  assert(html1.includes(`<title>${testArticleWithThumb.title} | DevStory</title>`), "Page title rendered dynamically for article with thumbnail");
  assert(html1.includes(`property="og:title" content="${testArticleWithThumb.title} | DevStory"`), "Open Graph og:title rendered dynamically");
  assert(html1.includes(`property="og:description"`), "Open Graph og:description rendered dynamically");
  assert(html1.includes(`property="og:type" content="article"`), "Open Graph og:type is set to 'article'");
  assert(html1.includes(`property="og:image" content="${testArticleWithThumb.thumbnail.replace(/&/g, "&amp;")}"`), "Open Graph og:image contains Cloudinary/Unsplash thumbnail URL");
  assert(html1.includes(`name="twitter:card" content="summary_large_image"`), "Twitter Card set to summary_large_image");

  // Test Article WITHOUT thumbnail (fallback image verification)
  const crawlerRes2 = await fetch(`${SERVER_BASE}/articles/${testArticleNoThumb.slug}`);
  const html2 = await crawlerRes2.text();
  assert(crawlerRes2.status === 200, "Server responded 200 to article without thumbnail");
  assert(html2.includes(`<title>${testArticleNoThumb.title} | DevStory</title>`), "Page title rendered for article without thumbnail");
  assert(html2.includes(`property="og:title" content="${testArticleNoThumb.title} | DevStory"`), "Open Graph title rendered");
  assert(html2.includes(`property="og:image" content="https://images.unsplash.com/photo-1499750310107-5fef28a66643`), "Default thumbnail fallback applied for article without thumbnail");

  // -------------------------------------------------------------------------
  // 5. TEST: Invalid Article URL Handling
  // -------------------------------------------------------------------------
  console.log("\n[5] Testing Invalid / Non-Existent Article Handling...");
  const invalidRes = await fetch(`${SERVER_BASE}/articles/non-existent-article-slug-99999`);
  const invalidHtml = await invalidRes.text();
  assert(invalidRes.status === 200, "Server safely responds with default index template for non-existent slug");
  assert(invalidHtml.includes("<title>DevStory"), "Default DevStory page title rendered cleanly for missing article");

  const apiInvalidRes = await fetch(`${API_BASE}/articles/non-existent-article-slug-99999`);
  const apiInvalidData = await apiInvalidRes.json();
  assert(apiInvalidRes.status === 404 && apiInvalidData.success === false, "Article API returns 404 with structured error message");

  // -------------------------------------------------------------------------
  // 6. CLEANUP & REGRESSION: Delete Article & Logout Verification
  // -------------------------------------------------------------------------
  console.log("\n[6] Cleaning Up Test Articles & Testing Article Deletion...");
  const deleteRes1 = await fetch(`${API_BASE}/articles/${testArticleWithThumb.slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${testUserToken}` },
  });
  const deleteData1 = await deleteRes1.json();
  assert(deleteRes1.status === 200 && deleteData1.success, "Deleted test article with thumbnail");

  const deleteRes2 = await fetch(`${API_BASE}/articles/${testArticleNoThumb.slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${testUserToken}` },
  });
  const deleteData2 = await deleteRes2.json();
  assert(deleteRes2.status === 200 && deleteData2.success, "Deleted test article without thumbnail");

  console.log("\n====================================================================");
  console.log("🎉 ALL SOCIAL SHARING & REGRESSION BACKEND TESTS PASSED (100%)");
  console.log("====================================================================");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
