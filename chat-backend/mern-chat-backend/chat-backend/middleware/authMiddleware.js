const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const bearerToken = header && header.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  const token = bearerToken || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findById(payload.sub).select("-password");
  if (!user) {
    return res.status(401).json({ success: false, message: "User no longer exists" });
  }

  req.user = user;
  next();
});

module.exports = { protect };
