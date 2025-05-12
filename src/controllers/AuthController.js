
const AuthService = require('../services/AuthService');

class AuthController {
    registerUser = async (req, res) => {
        try {
            const { name, email, password, phone, confirmPassword } = req.body;
            const emailRegex = /\S+@\S+\.\S+/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            const validPassword = passwordRegex.test(password);
            const validEmail = emailRegex.test(email);
            if ( !email || !password || !confirmPassword) {
                return res.status(400).json({
                    status: 'error', 
                    message: 'Vui lòng điền đầy đủ thông tin' 
                });
            }
            else if(!validEmail){
                return res.status(400).json({
                    status: 'error', 
                    message: 'Email không đúng định dạng' 
                });
            }else if(!validPassword){
                return res.status(400).json({
                    status: 'error',
                    message: 'Mật khẩu có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
                });
            }
            else if(password !== confirmPassword){
                return res.status(400).json({
                    status: 'error', 
                    message: 'Mật khẩu không khớp' 
                });
            }
            const data = await AuthService.registerUser(req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    loginUser = async (req, res) => {
        try {
            const { email, password } = req.body;
            const emailRegex = /\S+@\S+\.\S+/;
            if (!email || !password) {
                return res.status(400).json({
                    status: 'error', 
                    message: 'Vui lòng điền đầy đủ thông tin' 
                });
            }else if(!emailRegex.test(email)){
                return res.status(400).json({
                    status: 'error', 
                    message: 'Email không đúng định dạng' 
                });
            }
            const data = await AuthService.loginUser(req.body);
            const { refresh_token, ...newData } = data;
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true, // Chỉ cho phép truy cập cookie từ server, Ngăn frontend JavaScript truy cập cookie (bảo vệ khỏi XSS).
                secure: false, // Chỉ gửi cookie khi có https, Cho phép gửi cookie qua HTTP (chỉ dùng khi dev localhost). Trong production phải là true.
                sameSite: 'None', // Chỉ gửi cookie nếu frontend và backend cùng domain và không có request cross-site. Giúp chống CSRF.
                maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
            });
            res.json(newData);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    refreshToken = async (req, res) => {
        try {
            const refresh_token = req.cookies.refresh_token;
            if (!refresh_token) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp refresh token'
                });
            }
            const data = await AuthService.refreshToken(refresh_token);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    logoutUser = async (req, res) => {
        try {
            res.clearCookie('refresh_token');
            
            res.json({
                status: 'success', 
                message: 'Đăng xuất thành công' 
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}
module.exports = new AuthController();