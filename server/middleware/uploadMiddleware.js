import multer from "multer";
import path from "path";

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Use in-memory storage so files are held in RAM buffers without writing to disk
const storage = multer.memoryStorage();

// File filter function to validate file type
const fileFilter = (req, file, cb) => {
  const mimeMatch = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const extMatch = ALLOWED_EXTENSIONS.includes(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeMatch && extMatch) {
    return cb(null, true);
  }

  const error = new Error(
    "Invalid file type. Only JPEG, PNG, WebP, and GIF image files are permitted."
  );
  error.code = "INVALID_FILE_TYPE";
  error.status = 400;
  cb(error, false);
};

// Configure Multer instance
const multerInstance = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size limit
    files: 1, // Single file per request
  },
  fileFilter,
});

/**
 * Middleware wrapper for single image upload with clean error handling
 */
export const uploadSingleImage = (fieldName = "image") => {
  return (req, res, next) => {
    const upload = multerInstance.single(fieldName);

    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: "File too large. Maximum allowed file size is 5MB.",
            });
          }
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
              success: false,
              message: `Unexpected form field. Please upload under the field name '${fieldName}'.`,
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }

        if (err.code === "INVALID_FILE_TYPE" || err.status === 400) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "Failed to process uploaded file.",
        });
      }

      next();
    });
  };
};
