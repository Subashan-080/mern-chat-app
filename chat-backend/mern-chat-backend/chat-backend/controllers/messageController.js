const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const asyncHandler = require("../utils/asyncHandler");

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({ success: false, message: "Invalid conversation ID" });
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: req.user._id
  });
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const filter = { conversation: conversationId, deletedAt: null };
  if (req.query.before && !Number.isNaN(Date.parse(req.query.before))) {
    filter.createdAt = { $lt: new Date(req.query.before) };
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name avatar");

  res.json({
    success: true,
    messages: messages.reverse(),
    hasMore: messages.length === limit
  });
});

const editMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Message content is required" });
  }

  const message = await Message.findOne({
    _id: req.params.messageId,
    sender: req.user._id,
    deletedAt: null
  });
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });

  const conversation = await Conversation.findOne({
    _id: message.conversation,
    members: req.user._id
  });
  if (!conversation) return res.status(403).json({ success: false, message: "Not allowed" });

  message.content = content.trim();
  message.editedAt = new Date();
  await message.save();

  res.json({ success: true, message });
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOne({
    _id: req.params.messageId,
    sender: req.user._id,
    deletedAt: null
  });
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });

  message.content = "";
  message.deletedAt = new Date();
  await message.save();

  res.json({ success: true, message: "Message deleted" });
});

module.exports = { getMessages, editMessage, deleteMessage };
