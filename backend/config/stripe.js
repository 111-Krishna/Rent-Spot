// config/stripe.js
import Stripe from "stripe";

let stripe = null;
let initialized = false;

const getStripe = () => {
    if (!initialized) {
        initialized = true;
        if (process.env.STRIPE_SECRET_KEY) {
            stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            console.log("✅ Stripe initialized successfully.");
        } else {
            console.warn("Stripe secret key not found. Payment functionality is disabled.");
        }
    }
    return stripe;
};

export default getStripe;
