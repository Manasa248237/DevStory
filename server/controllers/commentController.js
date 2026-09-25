import mongoose from "mongoose";
import Comment from "../models/Comment.js";
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
 * @route   GET /api/articles/:articleId/comments
 * @route   GET /api/comments/article/:articleId
 * @desc    Get all comments for a specific article (sorted newest first)
 * @access  Public
 */
export const getCommentsByArticle = async (req, res, next) => {
  try {
    const articleParam = req.params.articleId || req.params.idOrSlug;

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

    // Fetch comments populated with user details (name, email, avatar, role)
    const comments = await Comment.find({ article: article._id })
      .populate("user", "name email avatar role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/articles/:articleId/comments
 * @route   POST /api/comments/article/:articleId
 * @desc    Create a new comment on an article
 * @access  Private (JWT protected)
 */
export const createComment = async (req, res, next) => {
  try {
    const articleParam = req.params.articleId || req.params.idOrSlug;
    const { content } = req.body;

    // 1. Validate content
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required and cannot be empty.",
      });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot exceed 1000 characters.",
      });
    }

    // 2. Resolve article
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

    // Restrict comments on draft articles to author or admin
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

    // 3. Create comment attached to req.user._id
    let comment = await Comment.create({
      article: article._id,
      user: req.user._id,
      content: trimmedContent,
    });

    // Populate user info for response
    comment = await comment.populate("user", "name email avatar role");

    res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Update an existing comment (Author or Admin only)
 * @access  Private (JWT protected)
 */
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // 1. Validate commentId format
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format.",
      });
    }

    // 2. Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // 3. Check ownership / authorization (Comment owner or Admin)
    const isCommentOwner = String(comment.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isCommentOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to edit this comment.",
      });
    }

    // 4. Validate content
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required and cannot be empty.",
      });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot exceed 1000 characters.",
      });
    }

    comment.content = trimmedContent;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email avatar role"
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete a comment (Comment author, Article author, or Admin)
 * @access  Private (JWT protected)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    // 1. Validate commentId format
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format.",
      });
    }

    // 2. Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // 3. Check authorization: comment author OR article author OR admin
    const isCommentOwner = String(comment.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    let isArticleOwner = false;
    if (!isCommentOwner && !isAdmin) {
      const article = await Article.findById(comment.article);
      if (article && String(article.author) === String(req.user._id)) {
        isArticleOwner = true;
      }
    }

    if (!isCommentOwner && !isArticleOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this comment.",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
