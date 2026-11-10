const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const populateConversation = (query) => query
  .populate("members", "name email avatar isOnline lastSeen")
  .populate({
    path: "lastMessage",
    populate: { path: "sender", select: "name avatar" }
  });

const createDirectConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!mongoose.isValidObjectId(userId) || userId === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: "A valid other userId is required" });
  }

  const otherUser = await User.findById(userId);
  if (!otherUser) return res.status(404).json({ success: false, message: "User not found" });

  let conversation = await Conversation.findOne({
    isGroup: false,
    members: { $all: [req.user._id, userId], $size: 2 }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [req.user._id, userId],
      isGroup: false
    });
  }

  conversation = await populateConversation(Conversation.findById(conversation._id));
  res.status(200).json({ success: true, conversation });
});

const createGroupConversation = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;
  if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
    return res.status(400).json({ success: false, message: "Group name and at least two other member IDs are required" });
  }

  const uniqueIds = [...new Set([...memberIds.map(String), req.user._id.toString()])];
  if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) {
    return res.status(400).json({ success: false, message: "One or more member IDs are invalid" });
  }

  const users = await User.find({ _id: { $in: uniqueIds } }).select("_id");
  if (users.length !== uniqueIds.length) {
    return res.status(400).json({ success: false, message: "One or more users do not exist" });
  }

  let conversation = await Conversation.create({
    members: uniqueIds,
    isGroup: true,
    groupName: name.trim(),
    admins: [req.user._id]
  });

  conversation = await populateConversation(Conversation.findById(conversation._id));
  res.status(201).json({ success: true, conversation });
});

const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await populateConversation(
    Conversation.find({ members: req.user._id }).sort({ updatedAt: -1 })
  );
  res.json({ success: true, conversations });
});

const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await populateConversation(
    Conversation.findOne({ _id: req.params.conversationId, members: req.user._id })
  );
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  res.json({ success: true, conversation });
});

module.exports = {
  createDirectConversation,
  createGroupConversation,
  getMyConversations,
  getConversationById
};
