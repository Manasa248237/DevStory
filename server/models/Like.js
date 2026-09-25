import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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

// Compound unique index to prevent duplicate likes from the same user on the same article
likeSchema.index({ user: 1, article: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;
