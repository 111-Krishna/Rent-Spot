import express from "express";
import { handleClerkWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Webhook endpoint for Clerk events
router.post("/clerk", handleClerkWebhook);

export default router;
