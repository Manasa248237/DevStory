import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Primary upload route: POST /api/upload
router.post("/", protect, uploadSingleImage("image"), uploadImage);

// Aliases for convenience: POST /api/upload/image and POST /api/upload/thumbnail
router.post("/image", protect, uploadSingleImage("image"), uploadImage);
router.post("/thumbnail", protect, uploadSingleImage("image"), uploadImage);

export default router;
