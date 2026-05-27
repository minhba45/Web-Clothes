const express=require('express');
const { authMiddleware, restrictToAdmin } = require('../middlewares/validateMiddleware');
const { addProduct,updateProduct,rmProduct,getAllProduct, getProduct} = require('../controllers/product.controller');
const { getProductDetails } = require('../services/product.service');
const router=express.Router();
router.post("/",authMiddleware,restrictToAdmin,addProduct);
router.patch("/:id",authMiddleware,restrictToAdmin,updateProduct);
router.delete("/:id",authMiddleware,restrictToAdmin,rmProduct);
router.get("/",getAllProduct);
router.get("/:id",getProduct)
module.exports=router;