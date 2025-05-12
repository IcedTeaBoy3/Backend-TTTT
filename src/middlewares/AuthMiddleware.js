const JwtService = require('../services/JWTService');

const Authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập'
            });
        }
        const decoded = await JwtService.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(403).json({
                status: 'error',
                message: 'Token không hợp lệ'
            });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
const Authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Bạn không có quyền truy cập'
            });
        }
        next();
    }
}
module.exports = {
    Authenticate,
    Authorize
}