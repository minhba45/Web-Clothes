const express=require('express');
const router=express.Router();
const {getAllCategory,addCategory}=require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/validateMiddleware');
router.get('/getAllcategory',authMiddleware,getAllCategory);
router.post('/addCategory',authMiddleware,addCategory);
module.exports=router;