require("dotenv").config();
const prisma = require("../src/config/prisma");

async function main() {
  const product = await prisma.product.findFirst({ where: { isActive: true } });
  if (!product) {
    console.log("No active product");
    return;
  }
  const variant = await prisma.productVariant.upsert({
    where: {
      productId_size_color: { productId: product.id, size: "M", color: "Den" },
    },
    update: { stock: 10 },
    create: { productId: product.id, size: "M", color: "Den", stock: 10 },
  });
  console.log("OK variant id:", variant.id, "product:", product.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
