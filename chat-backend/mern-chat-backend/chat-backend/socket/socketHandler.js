const mongoose = require("mongoose");
const socketAuth = require("./socketAuth");
const { addSocket, removeSocket, onlineUsers, getOnlineUserIds } = require("./onlineUsers");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

function initializeSocket(io) {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();

    addSocket(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Personal room allows notifying this user across all their devices.
    socket.join(`user:${userId}`);

    io.emit("presence:update", {
      userId,
      isOnline: true
    });

    // Join a conversation only after verifying membership.
    socket.on("conversation:join", async ({ conversationId } = {}, callback = () => {}) => {
      try {
        if (!mongoose.isValidObjectId(conversationId)) {
          return callback({ success: false, message: "Invalid conversation ID" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          members: socket.user._id
        }).select("_id");

        if (!conversation) {
          return callback({ success: false, message: "Conversation not found or access denied" });
        }

        socket.join(`conversation:${conversationId}`);
        callback({ success: true, conversationId });
      } catch {
        callback({ success: false, message: "Unable to join conversation" });
      }
    });

    // Persist message before broadcasting it to conversation members.
    socket.on("message:send", async (payload = {}, callback = () => {}) => {
      try {
        const { conversationId, content, clientMessageId } = payload;

        if (!mongoose.isValidObjectId(conversationId)) {
          return callback({ success: false, message: "Invalid conversation ID" });
        }
        if (typeof content !== "string" || !content.trim() || content.trim().length > 5000) {
          return callback({ success: false, message: "Message must contain 1–5000 characters" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          members: socket.user._id
        });

        if (!conversation) {
          return callback({ success: false, message: "Conversation not found or access denied" });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          content: content.trim(),
          readBy: [{ user: socket.user._id, readAt: new Date() }]
        });

        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        const populated = await Message.findById(message._id)
          .populate("sender", "name avatar");

        const result = {
          success: true,
          message: populated,
          clientMessageId: clientMessageId || null
        };

        io.to(`conversation:${conversationId}`).emit("message:new", populated);
        callback(result);
      } catch (error) {
        console.error("message:send error:", error);
        callback({ success: false, message: "Message could not be sent" });
      }
    });

    socket.on("typing:start", async ({ conversationId } = {}) => {
      if (!mongoose.isValidObjectId(conversationId)) return;
      const isMember = await Conversation.exists({
        _id: conversationId,
        members: socket.user._id
      });
      if (!isMember) return;

      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        user: { _id: userId, name: socket.user.name },
        isTyping: true
      });
    });

    socket.on("typing:stop", async ({ conversationId } = {}) => {
      if (!mongoose.isValidObjectId(conversationId)) return;
      const isMember = await Conversation.exists({
        _id: conversationId,
        members: socket.user._id
      });
      if (!isMember) return;

      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        user: { _id: userId, name: socket.user.name },
        isTyping: false
      });
    });

    socket.on("message:read", async ({ conversationId, messageId } = {}, callback = () => {}) => {
      try {
        if (!mongoose.isValidObjectId(conversationId) || !mongoose.isValidObjectId(messageId)) {
          return callback({ success: false, message: "Invalid ID" });
        }

        const isMember = await Conversation.exists({
          _id: conversationId,
          members: socket.user._id
        });
        if (!isMember) return callback({ success: false, message: "Access denied" });

        const message = await Message.findOneAndUpdate(
          { _id: messageId, conversation: conversationId },
          { $addToSet: { readBy: { user: socket.user._id, readAt: new Date() } } },
          { new: true }
        ).populate("readBy.user", "name");

        if (!message) return callback({ success: false, message: "Message not found" });

        io.to(`conversation:${conversationId}`).emit("message:read:update", {
          messageId,
          conversationId,
          readBy: message.readBy
        });
        callback({ success: true });
      } catch {
        callback({ success: false, message: "Unable to mark message as read" });
      }
    });

    socket.on("disconnect", async () => {
      const remainingSockets = removeSocket(userId, socket.id);

      // Only mark offline after the user's last tab/device disconnects.
      if (remainingSockets === 0) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        });
        io.emit("presence:update", {
          userId,
          isOnline: false,
          lastSeen: new Date()
        });
      }
    });
  });

  // Clients can request a snapshot after connecting.
  io.on("connection", (socket) => {
    socket.on("presence:get", (callback = () => {}) => {
      callback({ success: true, onlineUserIds: getOnlineUserIds() });
    });
  });
}

module.exports = initializeSocket;
