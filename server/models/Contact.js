import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
      maxlength: [255, "Email cannot exceed 255 characters."],
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      minlength: [2, "Subject must be at least 2 characters long."],
      maxlength: [200, "Subject cannot exceed 200 characters."],
    },
    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      minlength: [10, "Message must be at least 10 characters long."],
      maxlength: [5000, "Message cannot exceed 5000 characters."],
    },
    status: {
      type: String,
      enum: ["unread", "read", "archived", "replied"],
      default: "unread",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient admin sorting by date and status
contactSchema.index({ status: 1, createdAt: -1 });

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
