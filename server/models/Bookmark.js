import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article reference is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent a user from saving duplicate bookmarks for the same article
bookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
