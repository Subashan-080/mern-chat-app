const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function socketAuth(socket, next) {
  try {
    // Browser clients should pass { auth: { token } } when creating the socket.
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name avatar");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid or expired socket token"));
  }
}

module.exports = socketAuth;
