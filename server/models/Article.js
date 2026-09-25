import mongoose from "mongoose";

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
  }
);

// Function to generate slug from title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters except hyphens
    .replace(/[\s_-]+/g, "-")  // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ""); // Strip leading and trailing hyphens
}

// Pre-validate hook to generate unique slug
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
});

// Compound indexes for optimal query performance
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ status: 1, category: 1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;
