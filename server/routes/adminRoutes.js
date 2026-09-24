import express from "express";

const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Admin Dashboard API will be implemented in Phase 8: Admin Dashboard.",
  });
});

export default router;
