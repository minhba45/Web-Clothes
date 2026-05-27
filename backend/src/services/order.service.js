const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/ApiError'); 
const createOrder = async (userId, shippingAddress, phoneNumber) => {
    const cart = await prisma.cart.findUnique({
        where: { userId: userId },
        include: {
            items: {
                include: { variant: true }
            }
        }
    });

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Giỏ hàng của bạn đang trống");
    }

    let totalPrice = 0;
    for (const item of cart.items) {
        if (item.variant.stock < item.quantity) {
            throw new ApiError(400, `Sản phẩm (ID: ${item.productVariantId}) không đủ số lượng trong kho`);
        }
        totalPrice += item.quantity * item.variant.price; 
    }

    const result = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                userId: userId,
                totalPrice: totalPrice,
                shippingAddress: shippingAddress,
                phoneNumber: phoneNumber,
                status: 'PENDING',
                items: {
                    create: cart.items.map(item => ({
                        productVariantId: item.productVariantId,
                        quantity: item.quantity,
                        price: item.variant.price 
                    }))
                }
            }
        });
        for (const item of cart.items) {
            await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: {
                    stock: {
                        decrement: item.quantity 
                    }
                }
            });
        }
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
        });
        return newOrder;
    });

    return result;
};

module.exports = { createOrder };