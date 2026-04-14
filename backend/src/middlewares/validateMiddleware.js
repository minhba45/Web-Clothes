const { verifyToken } = require("../utils/jwt");
const { ApiError } = require("../utils/ApiError"); // Import ApiError để đồng bộ

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        // Thay vì res.json, ném lỗi ra để Global Error Handler xử lý
        return next(new ApiError(400, "Email, name, password are required"));
    }
    
    if (typeof email !== "string" || !email.includes("@")) {
        return next(new ApiError(400, "Invalid email format"));
    }
    
    if (typeof password !== "string" || password.length < 6) {
        return next(new ApiError(400, "Password must be at least 6 characters"));
    }
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ApiError(400, "Email and password are required"));
    }
    next();
};

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new ApiError(401, "Unauthorized - Missing Token"));
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new ApiError(401, "Invalid or expired token"));
    }
};

module.exports = { validateLogin, validateRegister, authMiddleware };