const CategoryService = require('../services/category.service');
const catchAsync = require('../utils/catchAsync');
const getAllCategory = catchAsync(async (req, res, next) => {
    const categories = await CategoryService.getAllCategory();
    
    return res.status(200).json({
        success: true, 
        message: "Lấy danh sách category thành công",
        data: categories
    });
});

const addCategory = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;
    const newCategory = await CategoryService.addCategory({ name, description });
    
    return res.status(201).json({
        success: true, 
        message: 'Tạo danh mục thành công',
        data: newCategory
    });
});

module.exports = { 
    getAllCategory, 
    addCategory 
};