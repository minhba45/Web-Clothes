const { Prisma } = require('@prisma/client');
const {ApiError}=require('../utils/ApiError');
const prisma=require('../config/prisma.js');
const getMe=async (userId)=>{
    const user=await prisma.user.findUnique({
      where:{id:userId},
      select:{id:true,name:true,email:true,role:true,createdAt:true,updatedAt:true}
    });
    if(!user){
      const error=new Error("User not found");
      error.statusCode=404;
      throw error;
    }
    return user;
};
const updateMe=async(userId,payload)=>{
  try{
  const {name,address,phone}=payload;
  const data={name,address,phone};
  const updateUser=await Prisma.User.update({
    where:{id:userId},
    data:data,
    select:{name:true,address:true,phone:true,role:true,createdAt:true,updatedAt:true}
  });
  return updateUser;
}
  catch(error){
    if(error.code==='P2025'){
      throw new ApiError(404,'User not found to update');
    }
    throw error;
  }
}
module.exports={getMe,updateMe};