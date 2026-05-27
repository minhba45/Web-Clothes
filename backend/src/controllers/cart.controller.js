const catchAsync=require("../utils/catchAsync");
const cartService=require("../services/cart.service");
const addToCart=catchAsync(async(req,res,next)=>{
    const userId = req.user.userId;
    console.log("Dữ liệu user từ Token:", req.user);
    const variantId = parseInt(req.body.variantId, 10);
    const quantity = parseInt(req.body.quantity, 10);
    if (!variantId || isNaN(variantId) || !quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập đúng id sản phẩm và số lượng phải là số nguyên lớn hơn 0"
        });
    }
    const newItem=await cartService.addToCart(userId,variantId,quantity);
    return res.status(200).json({
        success:true,
        message:"Thêm sản phẩm vào giỏ thành công",
        data:newItem
    });
});
const getCart = catchAsync(async (req, res, next) => {
    const userId = req.user.userId; 
    const cartDetails = await cartService.getCart(userId);
    return res.status(200).json({
        success: true,
        message: "Lấy thông tin giỏ hàng thành công",
        data: cartDetails
    });
});
const updateCartItem = catchAsync(async (req, res, next) => {
    const userId = req.user.userId;
    const variantId = parseInt(req.body.variantId, 10);
    const quantity = parseInt(req.body.quantity, 10);
    if (!variantId || isNaN(variantId) || !quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập đúng id sản phẩm và số lượng phải lớn hơn 0"
        });
    }

    const updatedItem = await cartService.updateCartItem(userId, variantId, quantity);

    return res.status(200).json({
        success: true,
        message: "Cập nhật số lượng thành công",
        data: updatedItem
    });
});

const removeCartItem = catchAsync(async (req, res, next) => {
    const userId = req.user.userId;
    const variantId = parseInt(req.params.variantId, 10);
    if (!variantId || isNaN(variantId)) {
        return res.status(400).json({
            success: false,
            message: "ID sản phẩm không hợp lệ"
        });
    }
    await cartService.removeCartItem(userId, variantId);
    return res.status(200).json({
        success: true,
        message: "Xóa sản phẩm khỏi giỏ thành công"
    });
});
module.exports={addToCart,getCart,updateCartItem,removeCartItem};