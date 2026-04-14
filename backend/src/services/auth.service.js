const { hashPassword, verifyPassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const prisma = require("../config/prisma");

const register = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("Email already exists!");
    error.statusCode = 400;
    throw error;
  }

  const passwordHashed = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHashed,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = generateToken({
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: newUser,
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHashed: true,
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password!");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await verifyPassword(password, user.passwordHashed);

  if (!isMatch) {
    const error = new Error("Invalid email or password!");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

module.exports = { register, login};