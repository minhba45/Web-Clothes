const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync'); 
const createOrder = catchAsync(async (req, res, next) => {
    const userId = req.user.userId;
    const { shippingAddress, phoneNumber } = req.body;
    if (!shippingAddress || !phoneNumber) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp đầy đủ địa chỉ giao hàng và số điện thoại"
        });
    }
    const order = await orderService.createOrder(userId, shippingAddress, phoneNumber);
    return res.status(201).json({
        success: true,
        message: "Đặt hàng thành công",
        data: order
    });
});
module.exports = { createOrder };