const router = require("express").Router();
const { searchUsers, getUserById } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/search", searchUsers);
router.get("/:userId", getUserById);

module.exports = router;
