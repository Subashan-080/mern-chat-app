const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const searchUsers = asyncHandler(async (req, res) => {
  const query = (req.query.q || "").trim();
  if (query.length < 2) {
    return res.json({ success: true, users: [] });
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { name: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { email: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    ]
  }).select("name email avatar isOnline lastSeen").limit(20);

  res.json({ success: true, users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("name email avatar isOnline lastSeen");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

module.exports = { searchUsers, getUserById };
