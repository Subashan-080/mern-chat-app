const router = require("express").Router();
const {
  createDirectConversation,
  createGroupConversation,
  getMyConversations,
  getConversationById
} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getMyConversations);
router.post("/direct", createDirectConversation);
router.post("/group", createGroupConversation);
router.get("/:conversationId", getConversationById);

module.exports = router;
