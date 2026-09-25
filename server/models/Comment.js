import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment content cannot be empty"],
      maxlength: [1000, "Comment content cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast chronological lookup of comments per article
commentSchema.index({ article: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
