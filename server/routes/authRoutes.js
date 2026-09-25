import express from "express";
import { signup, signin, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public authentication routes (with full aliasing support)
router.post("/signup", signup);
router.post("/register", signup);
router.post("/signin", signin);
router.post("/login", signin);

// Protected authentication routes
router.get("/me", protect, getMe);

export default router;
