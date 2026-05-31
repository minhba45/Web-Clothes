const prisma = require("../config/prisma");
const { ApiError } = require("../utils/ApiError");

const getAllCategory = async () => {
  return prisma.category.findMany({ orderBy: { id: "asc" } });
};

const addCategory = async (payload) => {
  const { name, description } = payload;
  const categoryExisting = await prisma.category.findUnique({ where: { name } });
  if (categoryExisting) {
    throw new ApiError(400, "Tên Category này đã tồn tại");
  }
  return prisma.category.create({
    data: { name, description },
  });
};

module.exports = { getAllCategory, addCategory };
