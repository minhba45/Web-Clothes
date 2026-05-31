const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/order.controller");
const { authMiddleware } = require("../middlewares/validateMiddleware"); 
router.post("/create", authMiddleware, createOrder);
module.exports = router;