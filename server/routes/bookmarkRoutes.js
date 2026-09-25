import express from "express";
import { getUserBookmarks } from "../controllers/bookmarkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/bookmarks - Retrieve authenticated user's saved/bookmarked articles
router.get("/", protect, getUserBookmarks);

export default router;
