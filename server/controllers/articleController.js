import mongoose from "mongoose";
import Article from "../models/Article.js";
import Comment from "../models/Comment.js";

// In-memory view deduplication cache (visitorKey -> timestamp)
const viewCooldownCache = new Map();
export const VIEW_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown per visitor per article

// Helper to determine if a view should be counted (prevents duplicate React mounts / rapid refreshes)
export function shouldCountView(req, articleId) {
  const visitorId = req.user?._id
    ? String(req.user._id)
    : req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "anonymous";
  const userAgent = (req.headers["user-agent"] || "").slice(0, 50);
  const cacheKey = `${articleId}_${visitorId}_${userAgent}`;

  const now = Date.now();
  const lastViewTime = viewCooldownCache.get(cacheKey);

  if (lastViewTime && now - lastViewTime < VIEW_COOLDOWN_MS) {
    return false; // within cooldown window
  }

  viewCooldownCache.set(cacheKey, now);
  return true;
}

// Clear view cache (useful for testing or cache reset)
export function clearViewCooldownCache() {
  viewCooldownCache.clear();
}

/**
 * Helper to find article by either MongoDB ObjectId or unique slug
 */
const findArticleByIdOrSlug = async (idOrSlug) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const article = await Article.findById(idOrSlug);
    if (article) return article;
  }
  return await Article.findOne({ slug: idOrSlug });
};

/**
 * @route   POST /api/articles
 * @desc    Create a new article
 * @access  Private (Authenticated users)
 */
export const createArticle = async (req, res, next) => {
  try {
    const { title, content, excerpt, thumbnail, category, tags, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Article title is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Article content is required.",
      });
    }

    // Process tags if passed as comma-separated string or array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      processedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim() || "",
      thumbnail: thumbnail?.trim() || undefined,
      category: category?.trim() || "General",
      tags: processedTags,
      status: status === "draft" ? "draft" : "published",
      viewCount: 0,
      author: req.user._id,
    });

    await article.save();
    await article.populate("author", "name email avatar role bio");

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/articles
 * @desc    Get all published articles with search, category filtering, and pagination
 * @access  Public
 */
export const getAllArticles = async (req, res, next) => {
  try {
    // Strictly restrict to published articles for public endpoints
    const filter = { status: "published" };

    // 1. Category filter
    if (req.query.category && req.query.category.trim() !== "" && req.query.category !== "All") {
      filter.category = req.query.category.trim();
    }

    // 2. Search query filter (matches title, excerpt, or content case-insensitively)
    const searchTerm = req.query.search || req.query.q || req.query.keyword;
    if (searchTerm && typeof searchTerm === "string" && searchTerm.trim() !== "") {
      const sanitized = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(sanitized, "i");
      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
      ];
    }

    // 3. Pagination setup
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 9));
    const skip = (page - 1) * limit;

    const total = await Article.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const articles = await Article.find(filter)
      .populate("author", "name email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      articles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/articles/my-articles
 * @desc    Get all articles authored by the logged-in user (drafts & published)
 * @access  Private
 */
export const getMyArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .populate("author", "name email avatar role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/articles/:idOrSlug
 * @desc    Get single article by ID or slug (increments view count for published with deduplication)
 * @access  Public (drafts restricted to author/admin)
 */
export const getArticleByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
    } else {
      query = { slug: idOrSlug };
    }

    const article = await Article.findOne(query).populate("author", "name email avatar role bio");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // If draft, ensure requesting user is author or admin (drafts never count views)
    if (article.status === "draft") {
      const isAuthor = req.user && String(article.author._id || article.author) === String(req.user._id);
      const isAdmin = req.user && req.user.role === "admin";

      if (!isAuthor && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }
    } else {
      // Only increment view count for published articles if outside cooldown window
      if (shouldCountView(req, article._id)) {
        await Article.updateOne({ _id: article._id }, { $inc: { viewCount: 1 } });
        article.viewCount = (article.viewCount || 0) + 1;
      }
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/articles/:idOrSlug/view
 * @desc    Explicitly record/increment article view count (throttled & deduplicated)
 * @access  Public
 */
export const recordArticleView = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const article = await findArticleByIdOrSlug(idOrSlug);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (article.status === "draft") {
      return res.status(200).json({
        success: true,
        counted: false,
        viewCount: article.viewCount || 0,
      });
    }

    let counted = false;
    if (shouldCountView(req, article._id)) {
      await Article.updateOne({ _id: article._id }, { $inc: { viewCount: 1 } });
      article.viewCount = (article.viewCount || 0) + 1;
      counted = true;
    }

    res.status(200).json({
      success: true,
      counted,
      viewCount: article.viewCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/articles/:idOrSlug/related
 * @desc    Get related published articles by category and tags relevance
 * @access  Public
 */
export const getRelatedArticles = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const limit = Math.max(1, Math.min(10, parseInt(req.query.limit, 10) || 3));

    const targetArticle = await findArticleByIdOrSlug(idOrSlug);

    if (!targetArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const targetTags = Array.isArray(targetArticle.tags) ? targetArticle.tags.filter(Boolean) : [];

    // Construct match criteria: published only, exclude self, matching category or shared tags
    const matchConditions = [
      { category: targetArticle.category },
    ];
    if (targetTags.length > 0) {
      matchConditions.push({ tags: { $in: targetTags } });
    }

    const relatedArticles = await Article.aggregate([
      {
        $match: {
          _id: { $ne: targetArticle._id },
          status: "published",
          $or: matchConditions,
        },
      },
      {
        $addFields: {
          // Category match gives 10 points
          categoryScore: {
            $cond: [{ $eq: ["$category", targetArticle.category] }, 10, 0],
          },
          // Shared tags give 2 points per common tag
          tagScore: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$tags", []] },
                targetTags,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          totalScore: { $add: ["$categoryScore", { $multiply: ["$tagScore", 2] }] },
        },
      },
      {
        $sort: { totalScore: -1, createdAt: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          title: 1,
          slug: 1,
          excerpt: 1,
          thumbnail: 1,
          category: 1,
          tags: 1,
          readTime: 1,
          author: 1,
          createdAt: 1,
          viewCount: 1,
          likesCount: 1,
          status: 1,
        },
      },
    ]);

    // Populate author info
    await Article.populate(relatedArticles, {
      path: "author",
      select: "name email avatar role",
    });

    res.status(200).json({
      success: true,
      count: relatedArticles.length,
      articles: relatedArticles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/articles/:idOrSlug
 * @desc    Update an article (Author or Admin only)
 * @access  Private
 */
export const updateArticle = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const article = await findArticleByIdOrSlug(idOrSlug);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check authorization: must be the author or an admin
    const isAuthor = String(article.author._id || article.author) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this article.",
      });
    }

    const { title, content, excerpt, thumbnail, category, tags, status } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Article title cannot be empty.",
        });
      }
      if (article.title !== title.trim()) {
        article.title = title.trim();
      }
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Article content cannot be empty.",
        });
      }
      article.content = content.trim();
    }

    if (excerpt !== undefined) article.excerpt = excerpt.trim();
    if (thumbnail !== undefined) article.thumbnail = thumbnail.trim();
    if (category !== undefined) article.category = category.trim();
    if (status !== undefined && ["draft", "published"].includes(status)) {
      article.status = status;
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        article.tags = tags.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof tags === "string") {
        article.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    await article.save();
    await article.populate("author", "name email avatar role bio");

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/articles/:idOrSlug
 * @desc    Delete an article (Author or Admin only)
 * @access  Private
 */
export const deleteArticle = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const article = await findArticleByIdOrSlug(idOrSlug);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check authorization: must be the author or an admin
    const isAuthor = String(article.author._id || article.author) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this article.",
      });
    }

    // Cascade delete associated comments
    await Comment.deleteMany({ article: article._id });

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
