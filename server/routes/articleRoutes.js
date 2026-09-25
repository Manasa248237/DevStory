import express from "express";
import {
  createArticle,
  getAllArticles,
  getArticleByIdOrSlug,
  updateArticle,
  deleteArticle,
  getMyArticles,
} from "../controllers/articleController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllArticles);

// Private route: Logged-in user's articles (Must be placed before /:idOrSlug)
router.get("/my-articles", protect, getMyArticles);

// Public / Semi-private route for single article (drafts visible only to author & admin)
router.get("/:idOrSlug", optionalAuth, getArticleByIdOrSlug);

// Private write routes
router.post("/", protect, createArticle);
router.put("/:idOrSlug", protect, updateArticle);
router.delete("/:idOrSlug", protect, deleteArticle);

export default router;
