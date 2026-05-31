const catchAsync = require("../utils/catchAsync");
const productService = require("../services/product.service");
const { ApiError } = require("../utils/ApiError");

const addProduct = catchAsync(async (req, res) => {
  const newProduct = await productService.addProduct(req.body);
  return res.status(201).json({
    success: true,
    message: "Add product success",
    data: newProduct,
  });
});

const rmProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ApiError(400, "ID product không hợp lệ");
  await productService.rmProduct(id);
  return res.status(200).json({
    success: true,
    message: "Remove Product successfully",
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ApiError(400, "Id product không hợp lệ");
  const newProduct = await productService.updateProduct(id, req.body);
  return res.status(200).json({
    success: true,
    message: "Update product successfully",
    data: newProduct,
  });
});

const getAllProduct = catchAsync(async (req, res) => {
  const filters = { ...req.query };
  const result = await productService.getAllProduct(filters);
  return res.status(200).json({
    success: true,
    message: "Lấy danh sách thành công",
    data: result.products,
    pagination: result.pagination,
  });
});

const getProduct = catchAsync(async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId) || productId <= 0) {
    throw new ApiError(400, "ID sản phẩm không hợp lệ");
  }
  const product = await productService.getProductDetails(productId);
  return res.status(200).json({
    success: true,
    message: "Lấy chi tiết sản phẩm thành công",
    data: product,
  });
});

module.exports = { addProduct, rmProduct, updateProduct, getAllProduct, getProduct };
