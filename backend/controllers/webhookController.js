import { Webhook } from "svix";
import User from "../models/User.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    // Convert buffer to string if needed
    const payload = typeof req.body === "string" ? req.body : req.body.toString();
    const headers = req.headers;

    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers);

    const eventType = evt.type;
    const data = evt.data;

    console.log(`Processing Clerk webhook: ${eventType}`, data);

    if (eventType === "user.created") {
      await handleUserCreated(data);
    } else if (eventType === "user.updated") {
      await handleUserUpdated(data);
    } else if (eventType === "user.deleted") {
      await handleUserDeleted(data);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
};

const handleUserCreated = async (clerkUser) => {
  try {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      image_url,
      email_verified,
    } = clerkUser;

    const email = email_addresses?.[0]?.email_address || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "Clerk User";

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      console.log(`User with clerkId ${clerkId} already exists`);
      return;
    }

    // Create new user
    const newUser = await User.create({
      clerkId,
      email,
      name,
      firstName: first_name,
      lastName: last_name,
      profileImageUrl: image_url,
      emailVerified: email_verified,
      password: `clerk_${Math.random().toString(36).slice(2, 12)}`,
      role: "user",
    });

    console.log(`User created successfully: ${newUser._id}`);
  } catch (error) {
    console.error("Error handling user.created webhook:", error);
    throw error;
  }
};

const handleUserUpdated = async (clerkUser) => {
  try {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      image_url,
      email_verified,
    } = clerkUser;

    const email = email_addresses?.[0]?.email_address || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "Clerk User";

    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        email,
        name,
        firstName: first_name,
        lastName: last_name,
        profileImageUrl: image_url,
        emailVerified: email_verified,
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`User updated successfully: ${updatedUser._id}`);
    } else {
      console.log(`User not found for clerkId: ${clerkId}`);
      // If user doesn't exist in DB, create it
      await handleUserCreated(clerkUser);
    }
  } catch (error) {
    console.error("Error handling user.updated webhook:", error);
    throw error;
  }
};

const handleUserDeleted = async (clerkUser) => {
  try {
    const { id: clerkId } = clerkUser;

    const deletedUser = await User.findOneAndDelete({ clerkId });

    if (deletedUser) {
      console.log(`User deleted successfully: ${deletedUser._id}`);
    } else {
      console.log(`User not found for deletion: ${clerkId}`);
    }
  } catch (error) {
    console.error("Error handling user.deleted webhook:", error);
    throw error;
  }
};
