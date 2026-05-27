const express=require("express");
const router=express.Router();
const {addToCart,getCart,updateCartItem,removeCartItem}=require("../controllers/cart.controller");
const { authMiddleware } = require("../middlewares/validateMiddleware");
router.post("/add",authMiddleware,addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/",authMiddleware,updateCartItem);
router.delete("/remove/:variantId", authMiddleware, removeCartItem);
module.exports=router;