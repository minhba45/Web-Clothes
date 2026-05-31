const prisma = require("../config/prisma");
const { ApiError } = require("../utils/ApiError");

const variantInclude = {
  productVariant: {
    include: { product: true },
  },
};

function linePrice(item) {
  return Number(item.productVariant.product.price) * item.quantity;
}

const addToCart = async (userId, variantId, quantity) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) {
    throw new ApiError(404, "Sản phẩm không tồn tại");
  }
  if (!variant.product.isActive) {
    throw new ApiError(400, "Sản phẩm không còn bán");
  }
  if (variant.stock < quantity) {
    throw new ApiError(400, "Số lượng yêu cầu vượt quá số lượng tồn kho");
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const existingVariant = await prisma.cartItem.findUnique({
    where: {
      cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
    },
  });

  if (!existingVariant) {
    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId: variantId,
        quantity,
      },
    });
  }

  const newQuantity = existingVariant.quantity + quantity;
  if (newQuantity > variant.stock) {
    throw new ApiError(400, "Tổng số lượng trong giỏ vượt quá tồn kho");
  }

  return prisma.cartItem.update({
    where: {
      cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
    },
    data: { quantity: newQuantity },
  });
};

const removeCartItem = async (userId, variantId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new ApiError(404, "Không tìm thấy giỏ hàng của người dùng");
  }
  try {
    await prisma.cartItem.delete({
      where: {
        cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
      },
    });
    return { message: "Xóa thành công" };
  } catch {
    throw new ApiError(404, "Sản phẩm không tồn tại trong giỏ hàng");
  }
};

const updateCartItem = async (userId, variantId, newQuantity) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new ApiError(404, "Không tìm thấy giỏ hàng");
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
    },
  });
  if (!existingItem) {
    throw new ApiError(404, "Không tìm thấy sản phẩm trong giỏ");
  }

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.stock < newQuantity) {
    throw new ApiError(400, "Vượt quá số lượng tồn kho");
  }

  return prisma.cartItem.update({
    where: {
      cartId_productVariantId: { cartId: cart.id, productVariantId: variantId },
    },
    data: { quantity: newQuantity },
  });
};

const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: variantInclude },
    },
  });

  if (!cart) {
    return { items: [], totalPrice: 0 };
  }

  const totalPrice = cart.items.reduce((sum, item) => sum + linePrice(item), 0);

  return { ...cart, totalPrice };
};

module.exports = { addToCart, removeCartItem, updateCartItem, getCart };
