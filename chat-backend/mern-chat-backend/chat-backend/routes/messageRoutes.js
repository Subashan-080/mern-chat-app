const router = require("express").Router();
const { getMessages, editMessage, deleteMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/conversation/:conversationId", getMessages);
router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

module.exports = router;
