const express = require("express");
const { authMiddleware } = require("../middlewares/validateMiddleware");
const { getMe, updateProfile } = require("../controllers/user.controller");

const router = express.Router();

router.get("/profile", authMiddleware, getMe);
router.patch("/profile", authMiddleware, updateProfile);

module.exports = router;
