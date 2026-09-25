import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscribers,
} from "../controllers/newsletterController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Protected Admin route
router.get("/subscribers", protect, adminOnly, getSubscribers);

export default router;
