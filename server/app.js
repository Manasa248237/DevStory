import express from "express";
import cors from "cors";
import morgan from "morgan";

// Middleware
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Root API Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to DevStory Blog REST API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// API Routes Mounting
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

// Catch-all 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
