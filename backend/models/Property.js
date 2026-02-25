// models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String },
    houseType: {
      type: String,
      enum: ["Houses", "Rooms", "Farm Houses", "Pool Houses", "Tent Houses", "Cabins", "Shops", "Forest Houses"],
      default: "Houses",
    },
    images: [{ type: String }],
    houseRules: { type: String, default: "" },
    checkInInstructions: { type: String, default: "" },
    wifiCode: { type: String, default: "" },
    parkingInstructions: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
