const User = require('../models/User');
const JwtService = require('./JWTService');
const MailService = require('./MailService');
const bcrypt = require('bcrypt');
class AuthService {
    registerUser = async (data) => {
        try {
            const { email, password } = data;
            // Kiểm tra email đã tồn tại
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return {
                    status: 'error',
                    message: 'Email đã tồn tại',
                };
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                email: email,
                password: hashPassword,
                isVerified: false, // Mặc định là chưa xác thực
            })
            if (!newUser) {
                return {
                    status: 'error',
                    message: 'Tạo tài khoản thất bại',
                };
            }
            // Tạo token tác thực email
            const verificationToken = JwtService.generateVerificationToken({
                id: newUser._id,
                email: newUser.email
            });
            // Gửi email xác thực
            await MailService.sendVerificationEmail(newUser.email, verificationToken);
           
            return {
                status: 'success',
                message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản',
                data: {
                    id: newUser._id,
                    email: newUser.email,
                }
            };

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
            if(!user?.isVerified){
                return {
                    status: "error",
                    message: "Tài khoản chưa được xác thực"
                }
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
    verifyEmail = async (token) => {
        try {
            const decoded = await JwtService.verifyToken(token, process.env.VERIFY_TOKEN_SECRET);
            if (!decoded) {
                return {
                    status: 'error',
                    message: 'Token xác thực không hợp lệ hoặc đã hết hạn',
                };
            }
            const userId = decoded.id;
            const user = await User.findById(userId);
            if (!user) {
                return {
                    status: 'error',
                    message: 'Người dùng không tồn tại',
                };
            }
            // Kiểm tra xem tài khoản đã được xác thực chưa
            if (user.isVerified) {
                return {
                    status: 'success',
                    message: 'Tài khoản đã được xác thực trước đó',
                };
            }
            user.isVerified = true;
            await user.save();
            return {
                status: 'success',
                message: 'Xác thực tài khoản thành công',
                data: {
                    email: decoded?.email
                }
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    changePassword = async (userId, data) => {
        try {
            const { currentPassword, newPassword } = data;
            const user = await User.findById(userId);
            if (!user) {
                return {
                    status: 'error',
                    message: 'Người dùng không tồn tại',
                };
            }
            const comparePassword = await bcrypt.compare(currentPassword, user.password);
            if (!comparePassword) {
                return {
                    status: 'error',
                    message: 'Mật khẩu hiện tại không đúng',
                };
            }
            const hashNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashNewPassword;
            await user.save();
            return {
                status: 'success',
                message: 'Đổi mật khẩu thành công',
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
}

module.exports = new AuthService();