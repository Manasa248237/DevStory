import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce both authentication and administrative privileges on all admin endpoints
router.use(protect, adminOnly);

/**
 * @route   GET /api/admin/check-auth
 * @desc    Verify that current session is authenticated and has administrative privileges
 * @access  Private / Admin
 */
router.get("/check-auth", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin authorization verified successfully.",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Placeholder for admin dashboard metrics
 * @access  Private / Admin
 */
router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin dashboard authorization verified.",
  });
});

export default router;

