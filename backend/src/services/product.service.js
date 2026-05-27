const { Prisma } = require('@prisma/client'); 
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const addProduct = async (payload) => {
    const { categoryId, name, description, price, isactive, imageURL, variants } = payload;
    const existingCategory = await prisma.category.findUnique({ 
        where: { id: Number(categoryId) } 
    });
    if (!existingCategory) {
        throw new ApiError(404, "Danh mục không tồn tại");
    }
    const newProduct = await prisma.product.create({
        data: {
            categoryId: Number(categoryId), 
            name,
            description,
            price: new Prisma.Decimal(price),
            isActive: isactive !== undefined ? isactive : true, 
            imageURL, 
            variants: variants && variants.length > 0 ? {
                create: variants.map(variant => ({
                    size: variant.size,
                    color: variant.color,
                    stock: Number(variant.stock || 0),
                    sku: variant.sku || null
                }))
            } : undefined
        },
        include: {
            variants: true
        }
    }); 
    return newProduct;
};
const rmProduct=async(id)=>{
    const existingProduct=await prisma.product.findUnique({
        where:{id}});
    if(!existingProduct){
        throw new ApiError(404,"Sản phẩm đã được xóa hoặc không tồn tại");
    }
    const productRemoved=await prisma.product.update({
        where:{id},
        data: {isActive:false}
    })
    return productRemoved;
}
const updateProduct = async (id, payload) => {
    const { categoryId, name, description, price, isactive, imageURL, variants } = payload;
    const existingProduct = await prisma.product.findUnique({
        where: { id}
    });
    
    if (!existingProduct) {
        throw new ApiError(404, "Sản phẩm không tồn tại để cập nhật!");
    }
    if (categoryId) {
        const existingCategory = await prisma.category.findUnique({
            where: { id: Number(categoryId) }
        });
        if (!existingCategory) {
            throw new ApiError(404, "Danh mục mới không tồn tại!");
        }
    }
    const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data: {
            name,
            description,
            imageURL,
            categoryId: categoryId ? Number(categoryId) : undefined,
            price: price ? new Prisma.Decimal(price) : undefined,
            isActive: isactive !== undefined ? isactive : undefined, 
            variants: variants ? {
                update: variants
                    .filter(variant => variant.id)
                    .map(variant => ({
                        where: { id: Number(variant.id) },
                        data: {
                            size: variant.size,
                            color: variant.color,
                            stock: variant.stock !== undefined ? Number(variant.stock) : undefined,
                            sku: variant.sku
                        }
                    })),
                create: variants
                    .filter(variant => !variant.id)
                    .map(variant => ({
                        size: variant.size,
                        color: variant.color,
                        stock: Number(variant.stock || 0),
                        sku: variant.sku || null
                    }))
                    
            } : undefined
        },
        include: {
            variants: true 
        }
    });
    return updatedProduct;
};
const getAllProduct=async(filters)=>{
    const {categoryId,search,limit=10,page=1,minprice,maxprice}=filters;
    const where={};
    if(categoryId){
        where.categoryId=categoryId;
    }
    if(search){
        where.name={contains:search,
            mod:"insensitive"
        }
    }
    if(minprice||maxprice){
        where.price={};
        if(minprice) where.price.gte=Number(minprice);
        if(maxprice) where.price.lte=Number(maxprice);
    }
    const skip=Number(page-1)*Number(limit);
    const take=Number(limit);
    const [products,total]=await Promise.all([
        prisma.product.findMany({where:where,
            skip:skip,
            take:take,
            include:{variants:true},
            orderBy:{createdAt:'desc'}
        },
        prisma.product.count({where:where})
        )
    ]);
    return {products,
        pagination:{totalItem:total,
            currentPage:Number(page),
            pageSize:Number(limit),
            totalPages:Math.ceil(total/Number(limit))
        }
    };
}
const getProductDetails=async(id)=>{
    const product=await prisma.product.findUnique({where:{id},
    include:{variants:true}
    });
    if(!product){
        throw new ApiError(404,"Không tìm thấy sản phẩm");
    }
    return product;
};
module.exports = {addProduct,rmProduct,updateProduct,getAllProduct,getProductDetails};
