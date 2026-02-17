import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Booking from "../models/Booking.js";

export const createPaymentOrder = async (req, res) => {
  if (!razorpay) return res.status(200).json({ message: "Payments are disabled" });

  const { amount, bookingId } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  if (!razorpay) return res.status(200).json({ message: "Payments are disabled" });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      const booking = await Booking.findById(bookingId);
      booking.status = "confirmed";
      await booking.save();
      res.json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
