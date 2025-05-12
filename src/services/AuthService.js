const User = require('../models/User');
const JwtService = require('./JWTService');
const bcrypt = require('bcrypt');
class AuthService {
    registerUser = async (data) => {
        try {
            const { email, password } = data;
            const checkEmail = await User.findOne({ email: email });
            if (checkEmail) {
                return {
                    status: 'error',
                    message: 'Email đã tồn tại',
                };
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                email: email,
                password: hashPassword,
            })
            if (newUser) {
                return {
                    status: 'success',
                    message: 'Tạo tài khoản thành công',
                    data: newUser,
                };
            }

        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    loginUser = async (data) => {
        try {
            const { email, password } = data;
            const user = await User.findOne({ email: email });
            if (!user) {
                return {
                    status: 'error',
                    message: 'Email không tồn tại',
                };
            }
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return {
                    status: 'error',
                    message: 'Sai mật khẩu',
                };  
            }
            const access_token = JwtService.generateAccessToken({
                id: user._id,
                role: user.role
            });
            const refresh_token = JwtService.generateRefreshToken({
                id: user._id,
                role: user.role
            });
            return {
                status: 'success',
                message: 'Đăng nhập thành công',
                access_token,
                refresh_token
            };
        }catch (error){
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    refreshToken = async (refresh_token) => {
        try {
            const data = await JwtService.refreshTokenService(refresh_token);
            return data;
        } catch (e) {
            return  {
                status: 'error',
                message: e.message
            };
        }
    }
}

module.exports = new AuthService();