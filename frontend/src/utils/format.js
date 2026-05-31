export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export function productImage(product) {
  return product?.imageUrl || product?.imageURL || null;
}

export function totalStock(variants = []) {
  return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}
