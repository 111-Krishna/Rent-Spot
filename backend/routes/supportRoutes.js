import express from "express";
import {
  createResolutionClaim,
  getBookingDetails,
  getListingInfo,
  supportChat,
} from "../controllers/supportController.js";

const router = express.Router();

router.get("/booking-details", getBookingDetails);
router.get("/listing-info", getListingInfo);
router.post("/resolution-center/claim", createResolutionClaim);
router.post("/support/chat", supportChat);

export default router;
