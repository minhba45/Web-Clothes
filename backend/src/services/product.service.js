const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const { ApiError } = require("../utils/ApiError");

function pickImageUrl(payload) {
  return payload.imageUrl ?? payload.imageURL ?? undefined;
}

function pickIsActive(payload) {
  if (payload.isActive !== undefined) return payload.isActive;
  if (payload.isactive !== undefined) return payload.isactive;
  return undefined;
}

const addProduct = async (payload) => {
  const { categoryId, name, description, price, variants } = payload;
  const imageUrl = pickImageUrl(payload);
  const isActive = pickIsActive(payload);

  const existingCategory = await prisma.category.findUnique({
    where: { id: Number(categoryId) },
  });
  if (!existingCategory) {
    throw new ApiError(404, "Danh mục không tồn tại");
  }

  return prisma.product.create({
    data: {
      categoryId: Number(categoryId),
      name,
      description,
      price: new Prisma.Decimal(price),
      isActive: isActive !== undefined ? isActive : true,
      imageUrl,
      variants:
        variants && variants.length > 0
          ? {
              create: variants.map((variant) => ({
                size: variant.size,
                color: variant.color,
                stock: Number(variant.stock || 0),
                sku: variant.sku || null,
              })),
            }
          : undefined,
    },
    include: { variants: true, category: true },
  });
};

const rmProduct = async (id) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new ApiError(404, "Sản phẩm đã được xóa hoặc không tồn tại");
  }
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};

const updateProduct = async (id, payload) => {
  const { categoryId, name, description, price, variants } = payload;
  const imageUrl = pickImageUrl(payload);
  const isActive = pickIsActive(payload);

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new ApiError(404, "Sản phẩm không tồn tại để cập nhật!");
  }

  if (categoryId) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!existingCategory) {
      throw new ApiError(404, "Danh mục mới không tồn tại!");
    }
  }

  return prisma.product.update({
    where: { id: Number(id) },
    data: {
      name,
      description,
      imageUrl,
      categoryId: categoryId ? Number(categoryId) : undefined,
      price: price ? new Prisma.Decimal(price) : undefined,
      isActive,
      variants: variants
        ? {
            update: variants
              .filter((variant) => variant.id)
              .map((variant) => ({
                where: { id: Number(variant.id) },
                data: {
                  size: variant.size,
                  color: variant.color,
                  stock:
                    variant.stock !== undefined ? Number(variant.stock) : undefined,
                  sku: variant.sku,
                },
              })),
            create: variants
              .filter((variant) => !variant.id)
              .map((variant) => ({
                size: variant.size,
                color: variant.color,
                stock: Number(variant.stock || 0),
                sku: variant.sku || null,
              })),
          }
        : undefined,
    },
    include: { variants: true, category: true },
  });
};

const getAllProduct = async (filters) => {
  const { categoryId, search, limit = 10, page = 1, minprice, maxprice } = filters;
  const where = { isActive: true };

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (minprice || maxprice) {
    where.price = {};
    if (minprice) where.price.gte = Number(minprice);
    if (maxprice) where.price.lte = Number(maxprice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      include: { variants: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      totalItem: total,
      currentPage: Number(page),
      pageSize: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

const getProductDetails = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });
  if (!product || !product.isActive) {
    throw new ApiError(404, "Không tìm thấy sản phẩm");
  }
  return product;
};

module.exports = {
  addProduct,
  rmProduct,
  updateProduct,
  getAllProduct,
  getProductDetails,
};
