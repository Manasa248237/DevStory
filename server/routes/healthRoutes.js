import express from "express";
import { getDatabaseStatus } from "../config/db.js";

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Comprehensive backend & database health check
 * @access  Public
 */
router.get("/", (req, res) => {
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    success: true,
    message: "Backend is running",
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
