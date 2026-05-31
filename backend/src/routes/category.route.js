const express = require("express");
const router = express.Router();
const { getAllCategory, addCategory } = require("../controllers/category.controller");
const { authMiddleware, restrictToAdmin } = require("../middlewares/validateMiddleware");

router.get("/", getAllCategory);
router.get("/getAllcategory", getAllCategory);
router.post("/addCategory", authMiddleware, restrictToAdmin, addCategory);

module.exports = router;
