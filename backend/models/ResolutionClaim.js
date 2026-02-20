import mongoose from "mongoose";

const resolutionClaimSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false,
    },
    requesterRole: {
      type: String,
      enum: ["host", "guest", "admin", "user"],
      default: "user",
    },
    issueType: {
      type: String,
      enum: ["damage", "extra-fee", "safety", "payment", "other"],
      default: "other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-review", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ResolutionClaim", resolutionClaimSchema);
