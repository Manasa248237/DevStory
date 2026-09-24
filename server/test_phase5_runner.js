// Using native fetch in Node 22+

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=================================================");
  console.log("DEVSTORY BLOG - PHASE 5 COMPREHENSIVE TEST SUITE");
  console.log("=================================================\n");

  const random = Math.floor(1000 + Math.random() * 9000);

  // Test 1: Server Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log(`[1] Health Check: ${healthRes.status} OK | DB Status: ${health.database}`);

  // Test 2: Register Author User
  const user1Data = {
    name: `Author Alex ${random}`,
    email: `author_${random}@test.com`,
    password: "Password123!",
    bio: "Full Stack Engineer & Tech Writer",
  };
  const reg1Res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user1Data),
  });
  const reg1 = await reg1Res.json();
  const token1 = reg1.token;
  const authorId = reg1.user.id;
  console.log(`[2] Register Author: ${reg1Res.status} Created | User: ${reg1.user.name}`);

  // Test 3: Register Second User (Non-Author)
  const user2Data = {
    name: `Reader Sam ${random}`,
    email: `reader_${random}@test.com`,
    password: "Password123!",
  };
  const reg2Res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user2Data),
  });
  const reg2 = await reg2Res.json();
  const token2 = reg2.token;
  console.log(`[3] Register Reader: ${reg2Res.status} Created | User: ${reg2.user.name}`);

  // Test 4: Unauthenticated Article Creation (Must return 401)
  const unauthRes = await fetch(`${BASE_URL}/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauth Post", content: "Should fail" }),
  });
  console.log(`[4] Unauthenticated Article Creation: ${unauthRes.status} (Expected 401 Unauthorized)`);

  // Test 5: Author Creates Published Article
  const articleData = {
    title: `Architecting Scalable React & Express Applications ${random}`,
    content: "Deep dive into clean architecture, REST API design, and MongoDB schemas.",
    category: "Architecture",
    tags: ["react", "nodejs", "mongodb"],
    status: "published",
  };
  const createRes = await fetch(`${BASE_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify(articleData),
  });
  const created = await createRes.json();
  const articleId = created.article._id;
  const articleSlug = created.article.slug;
  console.log(`[5] Author Creates Article: ${createRes.status} Created | Slug: ${articleSlug}`);

  // Test 6: Public Get All Articles
  const getAllRes = await fetch(`${BASE_URL}/articles`);
  const allArticles = await getAllRes.json();
  console.log(`[6] Public Get All Articles: ${getAllRes.status} OK | Count: ${allArticles.count}`);

  // Test 7: Public Get Article by Slug (Increments view count)
  const getSingleRes = await fetch(`${BASE_URL}/articles/${articleSlug}`);
  const single = await getSingleRes.json();
  console.log(`[7] Public Get Article by Slug: ${getSingleRes.status} OK | Views: ${single.article.viewCount}`);

  // Test 8: Unauthorized Update by Other User (Must return 403)
  const unauthorizedUpdateRes = await fetch(`${BASE_URL}/articles/${articleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({ title: "Hacked Title" }),
  });
  console.log(`[8] Unauthorized Update by Reader: ${unauthorizedUpdateRes.status} (Expected 403 Forbidden)`);

  // Test 9: Author Updates Own Article
  const updateRes = await fetch(`${BASE_URL}/articles/${articleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      title: `Architecting Scalable React & Express Applications ${random} (2nd Edition)`,
      category: "Engineering",
    }),
  });
  const updated = await updateRes.json();
  const updatedSlug = updated.article.slug;
  console.log(`[9] Author Updates Own Article: ${updateRes.status} OK | New Title: ${updated.article.title}`);

  // Test 10: Draft Creation and Privacy Verification
  const draftData = {
    title: `Confidential Upcoming Features ${random}`,
    content: "Unpublished roadmap draft.",
    status: "draft",
  };
  const draftRes = await fetch(`${BASE_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify(draftData),
  });
  const draft = await draftRes.json();
  const draftSlug = draft.article.slug;

  // 10a. Public fetch of draft should return 404
  const publicDraftRes = await fetch(`${BASE_URL}/articles/${draftSlug}`);
  console.log(`[10a] Public Get Draft Article: ${publicDraftRes.status} (Expected 404 Not Found)`);

  // 10b. Author fetch via /my-articles includes draft
  const myArticlesRes = await fetch(`${BASE_URL}/articles/my-articles`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const myArticles = await myArticlesRes.json();
  const foundDraft = myArticles.articles.find((a) => a.status === "draft");
  console.log(`[10b] Author /my-articles includes draft: ${foundDraft ? "YES (" + foundDraft.title + ")" : "NO"}`);

  // Test 11: Unauthorized Deletion by Other User (Must return 403)
  const unauthorizedDeleteRes = await fetch(`${BASE_URL}/articles/${articleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log(`[11] Unauthorized Delete by Reader: ${unauthorizedDeleteRes.status} (Expected 403 Forbidden)`);

  // Test 12: Author Deletes Own Article (by ID)
  const deleteRes = await fetch(`${BASE_URL}/articles/${articleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token1}` },
  });
  const deleted = await deleteRes.json();
  console.log(`[12] Author Deletes Own Article: ${deleteRes.status} OK | Message: ${deleted.message}`);

  // Test 13: Verify Deleted Article Returns 404
  const verifyDeleteRes = await fetch(`${BASE_URL}/articles/${articleId}`);
  console.log(`[13] Verify Deleted Article by ID: ${verifyDeleteRes.status} (Expected 404 Not Found)`);

  console.log("\n=================================================");
  console.log("ALL 13 BACKEND VERIFICATION TESTS COMPLETED!");
  console.log("=================================================");
}

runTests().catch(console.error);
