import mongoose from "mongoose";
import Like from "../models/Like.js";
import Article from "../models/Article.js";

/**
 * Helper to resolve article by ID or Slug
 */
async function resolveArticle(articleIdOrSlug) {
  if (!articleIdOrSlug || typeof articleIdOrSlug !== "string") {
    return null;
  }
  const trimmed = articleIdOrSlug.trim();
  if (!trimmed) {
    return null;
  }

  let query;
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    query = { $or: [{ _id: trimmed }, { slug: trimmed }] };
  } else {
    query = { slug: trimmed };
  }

  return await Article.findOne(query);
}

/**
 * @route   POST /api/articles/:id/like
 * @desc    Like a published article (Authenticated user)
 * @access  Private (JWT protected)
 */
export const likeArticle = async (req, res, next) => {
  try {
    const articleParam = req.params.id || req.params.articleId || req.params.idOrSlug;

    if (!articleParam) {
      return res.status(400).json({
        success: false,
        message: "Article ID or slug is required.",
      });
    }

    const article = await resolveArticle(articleParam);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    // If draft, ensure user is author or admin
    if (article.status === "draft") {
      const isAuthor = String(article.author) === String(req.user._id);
      const isAdmin = req.user.role === "admin";
      if (!isAuthor && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: "Article not found.",
        });
      }
    }

    // Check if user already liked this article
    const existingLike = await Like.findOne({
      user: req.user._id,
      article: article._id,
    });

    if (existingLike) {
      return res.status(200).json({
        success: true,
        isLiked: true,
        likesCount: article.likesCount || 0,
        message: "Article already liked.",
      });
    }

    // Create like document
    try {
      await Like.create({
        user: req.user._id,
        article: article._id,
      });
    } catch (err) {
      // Handle race condition if unique index catches duplicate insertion
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          isLiked: true,
          likesCount: article.likesCount || 0,
          message: "Article already liked.",
        });
      }
      throw err;
    }

    // Atomically increment article likesCount
    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      isLiked: true,
      likesCount: updatedArticle.likesCount,
      message: "Article liked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/articles/:id/like
 * @desc    Unlike an article (Authenticated user)
 * @access  Private (JWT protected)
 */
export const unlikeArticle = async (req, res, next) => {
  try {
    const articleParam = req.params.id || req.params.articleId || req.params.idOrSlug;

    if (!articleParam) {
      return res.status(400).json({
        success: false,
        message: "Article ID or slug is required.",
      });
    }

    const article = await resolveArticle(articleParam);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    // Check if user liked this article
    const existingLike = await Like.findOne({
      user: req.user._id,
      article: article._id,
    });

    if (!existingLike) {
      return res.status(200).json({
        success: true,
        isLiked: false,
        likesCount: article.likesCount || 0,
        message: "Article is not liked.",
      });
    }

    // Remove like document
    await Like.findByIdAndDelete(existingLike._id);

    // Atomically decrement likesCount (clamped to min 0)
    const currentCount = article.likesCount || 0;
    const newCount = Math.max(0, currentCount - 1);

    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      { likesCount: newCount },
      { new: true }
    );

    res.status(200).json({
      success: true,
      isLiked: false,
      likesCount: updatedArticle.likesCount,
      message: "Article unliked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/articles/:id/likes
 * @desc    Get article like count & current user's like status
 * @access  Public / Optional Auth
 */
export const getArticleLikeStatus = async (req, res, next) => {
  try {
    const articleParam = req.params.id || req.params.articleId || req.params.idOrSlug;

    if (!articleParam) {
      return res.status(400).json({
        success: false,
        message: "Article ID or slug is required.",
      });
    }

    const article = await resolveArticle(articleParam);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    let isLiked = false;
    if (req.user) {
      const likedDoc = await Like.exists({
        user: req.user._id,
        article: article._id,
      });
      isLiked = !!likedDoc;
    }

    res.status(200).json({
      success: true,
      likesCount: article.likesCount || 0,
      isLiked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/articles/:id/like/toggle
 * @desc    Toggle like status for an article
 * @access  Private (JWT protected)
 */
export const toggleArticleLike = async (req, res, next) => {
  try {
    const articleParam = req.params.id || req.params.articleId || req.params.idOrSlug;

    const article = await resolveArticle(articleParam);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    const existingLike = await Like.findOne({
      user: req.user._id,
      article: article._id,
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      const currentCount = article.likesCount || 0;
      const newCount = Math.max(0, currentCount - 1);
      const updatedArticle = await Article.findByIdAndUpdate(
        article._id,
        { likesCount: newCount },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        isLiked: false,
        likesCount: updatedArticle.likesCount,
        message: "Article unliked successfully.",
      });
    } else {
      // Like
      try {
        await Like.create({
          user: req.user._id,
          article: article._id,
        });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(200).json({
            success: true,
            isLiked: true,
            likesCount: article.likesCount || 0,
            message: "Article already liked.",
          });
        }
        throw err;
      }
      const updatedArticle = await Article.findByIdAndUpdate(
        article._id,
        { $inc: { likesCount: 1 } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        isLiked: true,
        likesCount: updatedArticle.likesCount,
        message: "Article liked successfully.",
      });
    }
  } catch (error) {
    next(error);
  }
};
