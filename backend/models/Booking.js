import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  priceTotal: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  stripeSessionId: { type: String, default: null },
  stripePaymentIntentId: { type: String, default: null },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
