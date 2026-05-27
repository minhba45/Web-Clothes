const catchAsync = require("../utils/catchAsync");
const productService=require('../services/product.service');
const { ApiError } = require("../utils/ApiError");
const { param } = require("express-validator");
const addProduct=catchAsync(async (req,res,next)=>{
    const payload=req.body;
    const newProduct=await productService.addProduct(payload);
    return res.status(201).json({
        success:true,
        message:"Add product success",
        data:newProduct
    });
});
const rmProduct=catchAsync(async (req,res,next)=>{
    const id=Number(req.params.id);
    if(isNaN(id)){throw new ApiError(400,"ID product không hợp lệ") }
    const existingProduct=await productService.rmProduct(id);
    return res.status(200).json({
        success:true,
        message:"Remove Product successfully"
    });
})
const updateProduct=catchAsync(async(req,res,next)=>{
    const id=Number(req.params.id);
    if(isNaN(id)){throw new ApiError(400,"Id product không hợp lệ")};
    const payload=req.body;
    const newProduct=await productService.updateProduct(id,payload);
    return res.status(200).json({
        success:true,
        message:"Update product successfully",
        data:newProduct
    });
});
const getAllProduct=catchAsync(async(req,res,next)=>{
    const filters=req.body;
    const result=await productService.getAllProduct(filters);
    return res.status(200).json({
        success:true,
        message:"Lấy danh sách thành công",
        data:result.products,
        pagination: result.pagination
    });
});
const getProductDetails=catchAsync(async(req,res,next)=>{
    const {id}=req.params;
    const productId=Number(id);
    if(isNaN(productId)||productId<=0){
        return res.status(400).json({
            success:false,
            message:"Id khong hop le"
        })
    }
    const product=await productService.getProductDetails(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy sản phẩm này"
        });
    }
    return res.status(200).json({
        success:true,
        message:"get Product successfully",
        data:product
    })
})
const getProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const productId = Number(id);
    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: "ID sản phẩm không hợp lệ" 
        });
    }
    const product = await productService.getProductDetails(productId);
    return res.status(200).json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: product
    });
});
module.exports={addProduct,rmProduct,updateProduct,getAllProduct,getProduct};