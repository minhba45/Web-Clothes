const userService=require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const getMe=async(req,res,next)=>{
    try
    {const result=await userService.getMe(req.user.userId);
    res.status(200).json({
        message:"Get profile successfully",
        data:result
    });
    }
    catch(error){
        next(error);
    }
}
const updateProfile=catchAsync(async(req,res,next)=>{
    const userId=req.user.id;
    const payload=req.body;
    const updateUser=await userService.updateMe(userId,payload);
    return res.status(200).json({
        success:true,
        message:'Update profile successfully',
        date:updateUser
    });
});
module.exports={getMe,updateProfile};