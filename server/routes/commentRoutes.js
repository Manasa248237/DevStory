import express from "express";
import {
  getCommentsByArticle,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Article comments sub-routes mounted under /api/comments/article/:articleId
router.get("/article/:articleId", getCommentsByArticle);
router.post("/article/:articleId", protect, createComment);

// Direct comment modification routes
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

export default router;
