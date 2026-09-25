import express from "express";
import cors from "cors";
import morgan from "morgan";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Middleware
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import mongoose from "mongoose";
import Article from "./models/Article.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../client/dist");

const app = express();

// Global Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 1. Direct authentication aliases (works for /login, /signin, /signup, /register on both root and /api)
app.post(["/login", "/signin", "/api/login", "/api/signin"], (req, res, next) => {
  req.url = req.url.includes("login") ? "/signin" : "/signin";
  authRoutes(req, res, next);
});

app.post(["/signup", "/register", "/api/signup", "/api/register"], (req, res, next) => {
  req.url = "/signup";
  authRoutes(req, res, next);
});

// 2. Canonical API Routes (/api/*)
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);

// 3. Compatibility routes for clients making requests without /api prefix
app.use("/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/users", userRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/upload", uploadRoutes);
app.use("/contact", contactRoutes);

// 4. Fallback rewriter for non-GET or JSON requests hitting /articles, /users, etc. without /api prefix
app.use((req, res, next) => {
  if (
    !req.path.startsWith("/api") &&
    (req.path.startsWith("/articles") ||
      req.path.startsWith("/users") ||
      req.path.startsWith("/comments") ||
      req.path.startsWith("/bookmarks") ||
      req.path.startsWith("/newsletter") ||
      req.path.startsWith("/upload") ||
      req.path.startsWith("/contact") ||
      req.path.startsWith("/admin"))
  ) {
    if (
      req.method !== "GET" ||
      req.headers.accept?.includes("application/json") ||
      req.headers["content-type"]?.includes("application/json") ||
      req.xhr
    ) {
      req.url = `/api${req.url}`;
      return app._router.handle(req, res, next);
    }
  }
  next();
});

// Helper to safely escape HTML attributes
function escapeHtmlAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replaceOrInsertMetaTag(html, attr, attrValue, content) {
  const regex = new RegExp(`<meta\\s+${attr}=["']${attrValue}["'][^>]*>`, "i");
  const newTag = `<meta ${attr}="${attrValue}" content="${escapeHtmlAttr(content)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, newTag);
  } else {
    return html.replace("</head>", `    ${newTag}\n  </head>`);
  }
}

// 5. Static frontend serving & Dynamic SEO / Open Graph injection for Articles
if (fs.existsSync(clientDistPath)) {
  const indexPath = path.join(clientDistPath, "index.html");

  // Dynamic Open Graph & Twitter Card Pre-render for Article Pages
  app.get(["/articles/:idOrSlug", "/articles/:idOrSlug/"], async (req, res, next) => {
    try {
      const { idOrSlug } = req.params;
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug };
      
      const article = await Article.findOne(query)
        .select("title excerpt thumbnail content category tags slug createdAt")
        .lean();

      if (!article || !fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }

      let html = fs.readFileSync(indexPath, "utf8");

      const fullTitle = `${article.title} | DevStory`;
      const fullDesc =
        article.excerpt ||
        (article.content ? article.content.replace(/<[^>]*>/gm, " ").trim().slice(0, 160) : "Engineering article on DevStory.");
      const fullImage =
        article.thumbnail ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80";
      
      const host = req.get("host") || "localhost:5000";
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const canonicalUrl = `${protocol}://${host}/articles/${article.slug || idOrSlug}`;

      // 1. Replace Document Title
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtmlAttr(fullTitle)}</title>`);

      // 2. SEO Meta Description
      html = replaceOrInsertMetaTag(html, "name", "description", fullDesc);

      // 3. Open Graph Tags
      html = replaceOrInsertMetaTag(html, "property", "og:site_name", "DevStory");
      html = replaceOrInsertMetaTag(html, "property", "og:title", fullTitle);
      html = replaceOrInsertMetaTag(html, "property", "og:description", fullDesc);
      html = replaceOrInsertMetaTag(html, "property", "og:image", fullImage);
      html = replaceOrInsertMetaTag(html, "property", "og:type", "article");
      html = replaceOrInsertMetaTag(html, "property", "og:url", canonicalUrl);

      // 4. Twitter / X Cards
      html = replaceOrInsertMetaTag(html, "name", "twitter:card", "summary_large_image");
      html = replaceOrInsertMetaTag(html, "name", "twitter:title", fullTitle);
      html = replaceOrInsertMetaTag(html, "name", "twitter:description", fullDesc);
      html = replaceOrInsertMetaTag(html, "name", "twitter:image", fullImage);
      html = replaceOrInsertMetaTag(html, "name", "twitter:url", canonicalUrl);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    } catch (err) {
      console.warn("Could not pre-render article meta tags:", err.message);
      return res.sendFile(indexPath);
    }
  });

  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(indexPath);
  });
} else {
  // Root API Welcome Route when frontend is not built on same host
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to DevStory Blog REST API",
      version: "1.0.0",
      docs: "/api/health",
    });
  });
}

// Catch-all 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
