const prisma = require("../config/prisma");
const { ApiError } = require("../utils/ApiError");
const addToCart=async(userId,variantId,quantity)=>{
    const variant=await prisma.productVariant.findUnique({where:{id:variantId}});
    if(!variant){
        throw new ApiError(404,"Sản phẩm không tồn tại")
    }
    if(variant.stock<quantity){
        throw new ApiError(400,"Số lượng yêu cầu vượt quá số lượng tồn kho");
    }
  let cart=await prisma.cart.upsert({
    where:{userId},
    update:{},
    create:{userId:userId}
});
  const existingVariant=await prisma.cartItem.findUnique({
    where:{
        cartId_productVariantId:{cartId:cart.id,productVariantId:variantId}
    }
  })
  if(!existingVariant){
    const newItem=await prisma.cartItem.create({
        data:{
            cartId:cart.id,
            productVariantId:variantId,
            quantity:quantity
        }
    });
    return newItem;
  }else{
    const newQuantity=existingVariant.quantity+quantity;
    if(newQuantity>variant.stock){
        throw new ApiError(400,"Tổng số lượng trong giỏ vượt quá tồn kho");
    }
    const newItem=await prisma.cartItem.update({
        where:{
            cartId_productVariantId:{cartId:cart.id,productVariantId:variantId}
        },
        data:{quantity:newQuantity}
    });
    return newItem;
  }
};
const removeCartItem=async(userId,variantId)=>{
    const cart=await prisma.cart.findUnique({
        where:{userId}
    });
    if(!cart){
        throw new ApiError(404,"Không tìm thấy giỏ hàng của người dùng");
    }
    try {
        const existingItem=await prisma.cartItem.delete({
            where:{
                cartId_productVariantId:{cartId:cart.id,productVariantId:variantId}
            }
        });
        return {message:"Xóa thành công"};
    } catch (error) {
        throw new ApiError(404, "Sản phẩm không tồn tại trong giỏ hàng");
    }
};
const updateItem=async(userId,variantId,newQuantity)=>{
    const cart=await prisma.cart.findUnique({where:{id:userId}});
    if(!cart){
        throw new ApiError(404,"Không tìm thấy giỏ hàng hoặc giỏ hàng không tồn tại");
    }
    const existingItem=await prisma.cartItem.findUnique({
        where:{
            cartId_productVariantId:{cartId:cart.id,productVariantId:variantId}
        }
    });
    if(!existingItem){
        throw new ApiError(404,"Không tìm thấy sản phẩm");
    }
    const variant=await prisma.productVariant.findUnique({where:{id:variantId}});
    if(variant.stock<newQuantity){
        throw new ApiError(400,"Vượt quá số lượng tồn kho");
    }
    const updateItem=await prisma.cartItem.update({
        where:{cartId_productVariantId:{cartId:cart.id,productVariantId:variantId},
        data:{quantity:newQuantity}
    }
    });
    return updateItem;
};
const getCart=async(userId)=>{
    const cart=await prisma.cart.findUnique({
        where:{id:userId},
        include:{
            items:{
                include:{
                    variant:{
                        include:{
                            product:true
                        }
                    }
                }
            }
        }
    });
    if(!cart){
        return{
            items:[],
            totalPrice:0
        };
    }
    let totalPrice = 0;
    cart.items.forEach(item => {
        totalPrice += item.quantity * item.variant.price; 
    });
    return {
        ...cart,
        totalPrice
    };
};
module.exports={addToCart,removeCartItem,updateItem,getCart};