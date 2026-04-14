const express=require('express');
const {authMiddleware}=require('../middlewares/validateMiddleware');
const router=express.Router();
const {getMe}=require('../controllers/user.controller');
const { updateMe } = require('../services/user.service');
router.get('/profile',authMiddleware,getMe);
router.post('./updateProfile',authMiddleware,updateMe);
module.exports=router;