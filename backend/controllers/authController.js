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
    res.json({
      message: "Clerk user synced successfully",
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
