import express from "express";
import {
  submitContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public contact submission
router.post("/", submitContactMessage);

// Admin inbox management endpoints
router.get("/", protect, adminOnly, getContactMessages);
router.get("/:id", protect, adminOnly, getContactMessageById);
router.patch("/:id/status", protect, adminOnly, updateContactMessageStatus);
router.delete("/:id", protect, adminOnly, deleteContactMessage);

export default router;
