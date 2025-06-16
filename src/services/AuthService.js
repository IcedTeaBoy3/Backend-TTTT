const User = require('../models/User');
const JwtService = require('./JwtService');
const MailService = require('./MailService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {OAuth2Client} = require('google-auth-library'); // Thêm thư viện Google Auth nếu cần
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
            // Đăng nhập bằng google không cần mật khẩu
            if(!user.has_password) {
                const hashNewPassword = await bcrypt.hash(newPassword, 10);
                user.password = hashNewPassword;
                user.has_password = true; // Đánh dấu là có mật khẩu
                await user.save();
                return {
                    status: 'success',
                    message: 'Thiết lập mật khẩu thành công',
                };
            }
            const comparePassword = await bcrypt.compare(currentPassword, user.password);
            if (!comparePassword) {
                return {
                    status: 'error',
                    message: 'Mật khẩu hiện tại không đúng',
                };
            }
            // 🛑 Kiểm tra trùng mật khẩu mới và cũ
            const isSameAsOld = await bcrypt.compare(newPassword, user.password);
            if (isSameAsOld) {
                return {
                    status: 'error',
                    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
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
    googleLogin = async (token) => {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture } = ticket.getPayload();
        const user = await User.findOne({ email: email });
        if (user) {
            // Nếu người dùng đã tồn tại, kiểm tra xem tài khoản đã được xác thực chưa
            if (!user.isVerified) {
                return {
                    status: 'error',
                    message: 'Tài khoản chưa được xác thực',
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
        } else {
            // Nếu người dùng chưa tồn tại, tạo mới
            const newUser = await User.create({
                email: email,
                name: name,
                avatar: picture,
                isVerified: true, // Mặc định là đã xác thực
                has_password: false // Không có mật khẩu
            });
            const access_token = JwtService.generateAccessToken({
                id: newUser._id,
                role: newUser.role
            });
            const refresh_token = JwtService.generateRefreshToken({
                id: newUser._id,
                role: newUser.role
            });
            return {
                status: 'success',
                message: 'Đăng nhập thành công',
                access_token,
                refresh_token
            };
        }
    }
    forgotPassword = async (email) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return {
                    status: 'error',
                    message: 'Email không tồn tại',
                };
            }
            //Kiểm tra nếu đã có yêu cầu trước đó
            if (user.resetPasswordToken && user.resetPasswordExpire > Date.now()) {
                return {
                    status: 'error',
                    message: 'Bạn đã yêu cầu đặt lại mật khẩu gần đây. Vui lòng kiểm tra email hoặc đợi 15 phút'
                };
            }

            // Tạo token reset password
            const resetToken = crypto.randomBytes(20).toString('hex');
            const hashedToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            // Lưu token và thời gian hết hạn vào database
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
            await user.save();
            // Gửi email với token
            try {

                await MailService.sendResetPasswordEmail(user.email, resetToken);

            }catch (error) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save();
                return {
                    status: 'error',
                    message: 'Gửi email thất bại: ' + error.message,
                };
            }
            return {
                status: 'success',
                message: 'Vui lòng kiểm tra email để đặt lại mật khẩu',
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    resetPassword = async (token, newPassword) => {
        try {
            
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');
            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { $gt: Date.now() } // Kiểm tra token còn hiệu lực
            });
            if (!user) {
                return {
                    status: 'error',
                    message: 'Token không hợp lệ hoặc đã hết hạn',
                };
            }
            if(user.has_password) {
                const isSameAsOld = await bcrypt.compare(newPassword, user.password);
                if (isSameAsOld) {
                    return {
                        status: 'error',
                        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
                    };
                }
            }
            // Mã hóa mật khẩu mới
            const hashNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashNewPassword;
            user.resetPasswordToken = undefined; // Xóa token sau khi đặt lại mật khẩu
            user.resetPasswordExpire = undefined; // Xóa thời gian hết hạn
            user.has_password = true; // Đánh dấu là có mật khẩu
            await user.save();
            return {
                status: 'success',
                message: 'Đặt lại mật khẩu thành công',
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