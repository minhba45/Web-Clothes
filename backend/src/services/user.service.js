const { ApiError } = require("../utils/ApiError");
const prisma = require("../config/prisma");

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

const updateMe = async (userId, payload) => {
  const { name, address, phone } = payload;
  const data = {};
  if (name !== undefined) data.name = name;
  if (address !== undefined) data.address = address;
  if (phone !== undefined) data.phone = phone;

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "Không có trường nào để cập nhật");
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new ApiError(404, "User not found to update");
    }
    throw error;
  }
};

module.exports = { getMe, updateMe };
