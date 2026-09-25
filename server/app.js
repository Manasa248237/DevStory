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
import adminRoutes from "./routes/adminRoutes.js";

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
app.use("/api/admin", adminRoutes);

// 3. Compatibility routes for clients making requests without /api prefix
app.use("/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/users", userRoutes);

// 4. Fallback rewriter for non-GET or JSON requests hitting /articles, /users, etc. without /api prefix
app.use((req, res, next) => {
  if (
    !req.path.startsWith("/api") &&
    (req.path.startsWith("/articles") ||
      req.path.startsWith("/users") ||
      req.path.startsWith("/comments") ||
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

// 5. Static frontend serving in production if built
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
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
