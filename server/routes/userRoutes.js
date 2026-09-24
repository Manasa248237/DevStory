import express from "express";

const router = express.Router();

router.get("/profile", (req, res) => {
  res.status(501).json({
    success: false,
    message: "User Profile API will be implemented in Phase 7: Additional Features.",
  });
});

export default router;
