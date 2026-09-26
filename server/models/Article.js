import mongoose from "mongoose";
import { calculateReadingTime } from "../utils/readingTime.js";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Article content is required"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      default: "",
    },
    readTime: {
      type: String,
      default: "1 min read",
    },
    thumbnail: {
      type: String,
      default: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "General",
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: "{VALUE} is not a valid status",
      },
      default: "published",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Function to generate clean URL-friendly slug from title
export function generateSlug(title) {
  if (!title || typeof title !== "string") return "article";

  const slug = title
    .normalize("NFD") // Decompose accented letters (é -> e + combining accent)
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics / accents
    .toLowerCase()
    .trim()
    .replace(/&+/g, "and") // Replace & with 'and'
    .replace(/[^\w\s-]/g, "") // Remove non-word characters except hyphens and whitespace
    .replace(/[\s_-]+/g, "-")  // Replace whitespace and underscores with a single hyphen
    .replace(/^-+|-+$/g, "") // Strip leading and trailing hyphens
    .substring(0, 100) // Keep slug concise for SEO and URL standards
    .replace(/-+$/, ""); // Strip trailing hyphen if substring cutoff created one

  return slug || "article";
}

// Pre-validate hook to generate unique slug, excerpt, and reading time
articleSchema.pre("validate", async function () {
  if (this.isModified("title") || !this.slug) {
    let baseSlug = generateSlug(this.title || "article");
    if (!baseSlug) baseSlug = "article";

    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists in DB (excluding current document)
    while (true) {
      const existing = await mongoose.models.Article?.findOne({
        slug,
        _id: { $ne: this._id },
      });

      if (!existing) {
        this.slug = slug;
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Auto-generate excerpt from content if empty
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]*>?/gm, "").trim();
    this.excerpt = plainText.length > 180 ? `${plainText.substring(0, 180)}...` : plainText;
  }

  // Auto-calculate reading time from content
  if (this.isModified("content") || !this.readTime) {
    this.readTime = calculateReadingTime(this.content || "");
  }
});

// Compound indexes for optimal query performance
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ status: 1, category: 1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;
