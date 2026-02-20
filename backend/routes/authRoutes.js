// routes/authRoutes.js
import express from "express";
import { getCurrentUser, syncClerkUser, getAllUsers, createTestUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/sync", protect, syncClerkUser);

// Debug routes (remove in production!)
router.get("/debug/users", getAllUsers);
router.post("/debug/create-test-user", createTestUser);

export default router;
