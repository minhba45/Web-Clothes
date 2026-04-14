const prisma = require("../config/prisma");
const {ApiError}=require("../utils/ApiError");
const getAllCategory=async()=>{
    const categories=await prisma.category.findMany({orderBy:{id:'asc'}});
    return categories;
};
const addCategory=async(payload)=>{
    const {name,description}=payload;
    const categoryExisting=await prisma.Category.findUnique({where:{name}});
    if(categoryExisting){
        throw new ApiError(400,"Tên Category này đã tồn tại");
    }
    const newCategory=await prisma.Category.create({
        data:{name,description},
        select:{name:true,description:true}
    });
    return newCategory;
};
module.exports={getAllCategory,addCategory};