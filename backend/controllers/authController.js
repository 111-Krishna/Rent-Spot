import User from "../models/User.js";

export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        clerkId: req.user.clerkId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncClerkUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile from Clerk data sent by the frontend
    const { name, email, firstName, lastName, profileImageUrl } = req.body;

    let updated = false;
    if (name && name !== "User" && user.name !== name) {
      user.name = name;
      updated = true;
    }
    if (email && !email.endsWith("@clerk.local") && user.email !== email) {
      user.email = email;
      updated = true;
    }
    if (firstName !== undefined && user.firstName !== firstName) {
      user.firstName = firstName;
      updated = true;
    }
    if (lastName !== undefined && user.lastName !== lastName) {
      user.lastName = lastName;
      updated = true;
    }
    if (profileImageUrl !== undefined && user.profileImageUrl !== profileImageUrl) {
      user.profileImageUrl = profileImageUrl;
      updated = true;
    }

    if (updated) {
      await user.save();
      console.log(`User profile updated from Clerk: ${user._id} → ${user.name} (${user.email})`);
    }

    res.json({
      message: "Clerk user synced successfully",
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Debug endpoint - get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      message: "All users fetched",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Debug endpoint - manually create a test user
export const createTestUser = async (req, res) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({ message: "clerkId, email, and name are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ clerkId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this clerkId or email already exists" });
    }

    const testUser = await User.create({
      clerkId,
      email,
      name,
      password: `clerk_${Math.random().toString(36).slice(2, 12)}`,
      role: "user",
    });

    res.json({
      message: "Test user created successfully",
      user: testUser,
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.toString() === id && role !== "admin") {
      return res.status(400).json({ message: "You cannot demote yourself" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: error.message });
  }
};
