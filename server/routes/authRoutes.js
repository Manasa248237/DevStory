import express from "express";
import { signup, signin, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public authentication routes
router.post("/signup", signup);
router.post("/signin", signin);

// Protected authentication routes
router.get("/me", protect, getMe);

export default router;
