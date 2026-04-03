// routes/authRoutes.js
import express from "express";
import { getCurrentUser, syncClerkUser, getAllUsers, createTestUser, updateUserRole } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/sync", protect, syncClerkUser);

// Admin-only routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);

// Debug routes (remove in production!)
router.post("/debug/create-test-user", createTestUser);

export default router;
