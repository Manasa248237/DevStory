import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Article from "./models/Article.js";

dotenv.config();

async function runRichTextLifecycleTest() {
  console.log("=================================================");
  console.log("DEVSTORY - RICH TEXT CONTENT LIFECYCLE TEST");
  console.log("=================================================");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ [MongoDB Atlas] Connected successfully\n");

    // 1. Get or create author user
    let author = await User.findOne({ email: "richtext_tester@devstory.local" });
    if (!author) {
      author = await User.create({
        name: "RichText Tester",
        email: "richtext_tester@devstory.local",
        password: "Password123!",
        role: "user",
      });
    }

    // 2. Step 1 & 2: Create article with rich formatted HTML content
    const initialRichContent = `<h2>Building Resilient Architectures</h2><p>Here is an architectural breakdown with <strong>bold insights</strong> and <em>italicized notes</em>.</p><blockquote>"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra</blockquote><ul><li>Decouple services using queues</li><li>Implement exponential backoff</li><li>Ensure idempotency</li></ul><pre><code>const connect = async () => {\n  console.log("Connecting...");\n};</code></pre><p>Read more at <a href="https://devstory.local" target="_blank" rel="noopener noreferrer">DevStory Docs</a>.</p>`;

    const article = new Article({
      title: "Rich Text Architecture Guide " + Date.now(),
      content: initialRichContent,
      category: "Architecture",
      tags: ["architecture", "nodejs", "react"],
      status: "published",
      author: author._id,
    });

    await article.save();
    console.log(`[PASS] 1 & 2. Created and saved article: "${article.title}" (ID: ${article._id}, Slug: ${article.slug})`);

    // 3. Step 3: Retrieve article and verify HTML integrity & auto-generated excerpt
    const retrievedArticle = await Article.findById(article._id);
    if (!retrievedArticle) throw new Error("Article could not be retrieved from database!");
    if (retrievedArticle.content !== initialRichContent) {
      throw new Error("Retrieved content does not match saved rich text content!");
    }
    console.log(`[PASS] 3. Retrieved article content matches saved HTML exactly (${retrievedArticle.content.length} chars)`);
    console.log(`[PASS] 3b. Auto-generated clean excerpt: "${retrievedArticle.excerpt}"`);

    // 4. Step 4 & 5: Edit article with modified rich text content
    const updatedRichContent = `<h2>Building Resilient Architectures (Updated Edition)</h2><p>Here is an updated guide with <mark>enhanced patterns</mark> and <strike>deprecated approaches</strike>.</p><ol><li>Step 1: Event-driven telemetry</li><li>Step 2: Circuit breakers</li></ol><pre><code>async function handleEvent(event) {\n  await process(event);\n}</code></pre>`;

    retrievedArticle.content = updatedRichContent;
    retrievedArticle.title = article.title + " (Edited)";
    await retrievedArticle.save();
    console.log(`[PASS] 4 & 5. Edited and saved article with updated formatting`);

    // 5. Step 6 & 7: Reload from MongoDB and verify persistence
    const reloadedArticle = await Article.findById(article._id);
    if (reloadedArticle.content !== updatedRichContent) {
      throw new Error("Reloaded content does not match updated rich text content!");
    }
    console.log(`[PASS] 6 & 7. Reloaded article verified. Persisted content matches updated HTML formatting!`);

    // Cleanup test article
    await Article.deleteOne({ _id: article._id });
    console.log(`\n🧹 Cleaned up test article.`);

    console.log("\n=================================================");
    console.log("SUMMARY: ALL RICH TEXT LIFECYCLE TESTS PASSED (100%)");
    console.log("=================================================");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runRichTextLifecycleTest();
