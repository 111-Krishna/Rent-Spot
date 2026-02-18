// routes/authRoutes.js
import express from "express";
import { getCurrentUser, syncClerkUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.post("/sync", protect, syncClerkUser);

export default router;
