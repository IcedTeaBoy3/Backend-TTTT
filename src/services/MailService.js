const nodemailer = require('nodemailer');

class MailService {
    sendVerificationEmail = async (email, token) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_ACCOUNT, // Tài khoản Gmail
                pass: process.env.MAIL_PASSWORD, // Mật khẩu ứng dụng 
            }
        });
        const mailOptions = {
            from: process.env.MAIL_ACCOUNT,
            to: email,
            subject: 'Xác thực tài khoản',
            html: `
                <h1>Xác thực tài khoản của bạn</h1>
                <p>Vui lòng nhấp vào liên kết bên dưới để xác thực tài khoản của bạn:</p>
                <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">Xác thực tài khoản</a>
                <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
            `
        };

         try {
            await transporter.sendMail(mailOptions);
            
        } catch (error) {
            console.error('Lỗi gửi email:', error);
            return {
                status: 'error',
                message: 'Gửi email thất bại: ' + error.message
            };
        }
    }
}
module.exports = new MailService();