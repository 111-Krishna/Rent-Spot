// routes/bookingRoutes.js
import express from "express";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getUserBookings);

// Admin routes
router.get("/", protect, authorize("admin"), getAllBookings);
router.put("/:id/status", protect, authorize("admin"), updateBookingStatus);

export default router;
