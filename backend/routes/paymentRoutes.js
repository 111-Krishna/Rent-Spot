import express from "express";
import razorpay from "../config/razorpay.js";
import { verifyPayment } from "../controllers/paymentController.js";




const router = express.Router();

// Create an order
router.post("/order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // amount in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
    router.post("/verify", verifyPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
