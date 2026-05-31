const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const { ApiError } = require("../utils/ApiError");

const createOrder = async (userId, shippingAddress, phoneNumber) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Giỏ hàng của bạn đang trống");
  }

  let subtotal = 0;
  for (const item of cart.items) {
    const { productVariant } = item;
    if (productVariant.stock < item.quantity) {
      throw new ApiError(
        400,
        `Sản phẩm "${productVariant.product.name}" không đủ số lượng trong kho`
      );
    }
    subtotal += item.quantity * Number(productVariant.product.price);
  }

  const result = await prisma.$transaction(async (tx) => {
    if (phoneNumber) {
      await tx.user.update({
        where: { id: userId },
        data: { phone: phoneNumber },
      });
    }

    const newOrder = await tx.order.create({
      data: {
        userId,
        subtotal: new Prisma.Decimal(subtotal),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(subtotal),
        shippingAddress,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: "COD",
        items: {
          create: cart.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceAtPurchase: item.productVariant.product.price,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return result;
};

module.exports = { createOrder };
