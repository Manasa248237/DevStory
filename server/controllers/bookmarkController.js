import mongoose from "mongoose";
import Bookmark from "../models/Bookmark.js";
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
 * @route   POST /api/articles/:id/bookmark
 * @desc    Bookmark/save a published article for the authenticated user
 * @access  Private (JWT protected)
 */
export const bookmarkArticle = async (req, res, next) => {
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

    // Check if user already bookmarked this article
    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      article: article._id,
    });

    if (existingBookmark) {
      return res.status(200).json({
        success: true,
        isBookmarked: true,
        message: "Article already bookmarked.",
      });
    }

    // Create bookmark document
    try {
      await Bookmark.create({
        user: req.user._id,
        article: article._id,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          isBookmarked: true,
          message: "Article already bookmarked.",
        });
      }
      throw err;
    }

    res.status(200).json({
      success: true,
      isBookmarked: true,
      message: "Article bookmarked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/articles/:id/bookmark
 * @desc    Remove a bookmark for the authenticated user
 * @access  Private (JWT protected)
 */
export const unbookmarkArticle = async (req, res, next) => {
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

    // Remove bookmark
    await Bookmark.findOneAndDelete({
      user: req.user._id,
      article: article._id,
    });

    res.status(200).json({
      success: true,
      isBookmarked: false,
      message: "Bookmark removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/articles/:id/bookmark-status
 * @desc    Get whether current user has bookmarked this article
 * @access  Private / Optional Auth
 */
export const getArticleBookmarkStatus = async (req, res, next) => {
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

    let isBookmarked = false;
    if (req.user) {
      const found = await Bookmark.exists({
        user: req.user._id,
        article: article._id,
      });
      isBookmarked = !!found;
    }

    res.status(200).json({
      success: true,
      isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/articles/:id/bookmark/toggle
 * @desc    Toggle bookmark status for an article
 * @access  Private (JWT protected)
 */
export const toggleArticleBookmark = async (req, res, next) => {
  try {
    const articleParam = req.params.id || req.params.articleId || req.params.idOrSlug;

    const article = await resolveArticle(articleParam);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      article: article._id,
    });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: "Bookmark removed successfully.",
      });
    } else {
      try {
        await Bookmark.create({
          user: req.user._id,
          article: article._id,
        });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(200).json({
            success: true,
            isBookmarked: true,
            message: "Article already bookmarked.",
          });
        }
        throw err;
      }
      return res.status(200).json({
        success: true,
        isBookmarked: true,
        message: "Article bookmarked successfully.",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookmarks
 * @desc    Get all bookmarked articles for the authenticated user
 * @access  Private (JWT protected)
 */
export const getUserBookmarks = async (req, res, next) => {
  try {
    const rawBookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "article",
        populate: {
          path: "author",
          select: "name avatar bio username",
        },
      });

    // Filter out any bookmarks whose target article was deleted or is missing
    const validBookmarks = rawBookmarks.filter(
      (b) => b.article && (b.article.status === "published" || String(b.article.author?._id) === String(req.user._id) || req.user.role === "admin")
    );

    res.status(200).json({
      success: true,
      count: validBookmarks.length,
      bookmarks: validBookmarks,
    });
  } catch (error) {
    next(error);
  }
};
