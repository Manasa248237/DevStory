import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected profile endpoints
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Convenient aliases for /me
router.get("/me", protect, getUserProfile);
router.put("/me", protect, updateUserProfile);

export default router;
