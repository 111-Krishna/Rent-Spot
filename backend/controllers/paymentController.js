import getStripe from "../config/stripe.js";
import Booking from "../models/Booking.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8080";

export const createCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(200).json({ message: "Payments are disabled. Please configure STRIPE_SECRET_KEY." });

  const { bookingId, propertyId, amount, propertyTitle } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: propertyTitle || "Property Rental",
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/home/${propertyId}/payment`,
      metadata: {
        bookingId,
        propertyId,
      },
    });

    // Store Stripe session ID on the booking
    await Booking.findByIdAndUpdate(bookingId, { stripeSessionId: session.id });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(200).json({ received: true });

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.status = "confirmed";
          booking.stripePaymentIntentId = session.payment_intent || null;
          booking.paidAt = new Date();
          await booking.save();
          console.log(`Booking ${bookingId} confirmed via Stripe webhook.`);
        }
      } catch (err) {
        console.error("Error updating booking from webhook:", err);
      }
    }
  }

  res.json({ received: true });
};

// Verify session status (called from frontend success page)
export const getSessionStatus = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(200).json({ message: "Payments are disabled" });

  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const bookingId = session.metadata?.bookingId;

    // Also confirm booking if payment succeeded (fallback if webhook didn't fire)
    if (session.payment_status === "paid" && bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.status !== "confirmed") {
        booking.status = "confirmed";
        await booking.save();
      }
    }

    res.json({
      status: session.payment_status,
      bookingId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
