import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Property from "../models/Property.js";

const deleteOldListings = async () => {
    try {
        await connectDB();

        // Two days ago from right now
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        console.log(`🗓️  Deleting properties created before: ${twoDaysAgo.toISOString()}`);

        const result = await Property.deleteMany({
            createdAt: { $lt: twoDaysAgo },
        });

        console.log(`✅ Deleted ${result.deletedCount} old listing(s).`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

deleteOldListings();
