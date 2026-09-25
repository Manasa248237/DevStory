import express from "express";
import {
  createArticle,
  getAllArticles,
  getArticleByIdOrSlug,
  updateArticle,
  deleteArticle,
  getMyArticles,
} from "../controllers/articleController.js";
import {
  getCommentsByArticle,
  createComment,
} from "../controllers/commentController.js";
import {
  likeArticle,
  unlikeArticle,
  getArticleLikeStatus,
  toggleArticleLike,
} from "../controllers/likeController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllArticles);

// Private route: Logged-in user's articles (Must be placed before /:idOrSlug)
router.get("/my-articles", protect, getMyArticles);

// Comments sub-routes mounted under /api/articles/:articleId/comments
router.get("/:articleId/comments", getCommentsByArticle);
router.post("/:articleId/comments", protect, createComment);

// Likes sub-routes mounted under /api/articles/:id/likes and /api/articles/:id/like
router.get("/:id/likes", optionalAuth, getArticleLikeStatus);
router.post("/:id/like", protect, likeArticle);
router.delete("/:id/like", protect, unlikeArticle);
router.post("/:id/like/toggle", protect, toggleArticleLike);

// Public / Semi-private route for single article (drafts visible only to author & admin)
router.get("/:idOrSlug", optionalAuth, getArticleByIdOrSlug);

// Private write routes
router.post("/", protect, createArticle);
router.put("/:idOrSlug", protect, updateArticle);
router.delete("/:idOrSlug", protect, deleteArticle);

export default router;
