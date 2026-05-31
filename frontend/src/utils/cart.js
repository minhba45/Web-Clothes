import { formatPrice, productImage } from "./format.js";

export function normalizeCartItem(item) {
  const variant = item.productVariant || item.variant;
  const product = variant?.product;
  const price = product?.price ?? variant?.price ?? 0;
  const variantId = item.productVariantId ?? variant?.id;

  return {
    id: item.id,
    quantity: item.quantity,
    variantId,
    productId: product?.id,
    size: variant?.size,
    color: variant?.color,
    stock: variant?.stock ?? 0,
    productName: product?.name ?? "Sản phẩm",
    productImage: productImage(product),
    unitPrice: price,
    lineTotal: Number(price) * item.quantity,
  };
}

export function computeCartTotal(items) {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

export { formatPrice };
