const nodemailer = require('nodemailer');
const {addMinutesToTime} = require('../utils/timeUtils');
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
    sendBookingSuccessEmail =  async (email, bookingDetails) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_ACCOUNT, // Gmail
                pass: process.env.MAIL_PASSWORD // Mật khẩu ứng dụng
            }
        });

        const {
            patientName,
            doctorName,
            addressHospital,
            scheduleDate,
            timeSlot,
            reason,
            stt
        } = bookingDetails;

        const formattedDate = new Date(scheduleDate).toLocaleDateString('vi-VN');

        const mailOptions = {
            from: process.env.MAIL_ACCOUNT,
            to: email,
            subject: 'Xác nhận đặt lịch hẹn thành công',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; background-color: #f9f9f9;">
                    <h2 style="color: #2e6c80;">Xác nhận đặt lịch hẹn khám bệnh</h2>
                    <p>Xin chào <strong>${patientName}</strong>,</p>
                    <p>Bạn đã đặt lịch hẹn thành công với bác sĩ <strong>${doctorName}</strong>.</p>

                    <h3>Chi tiết lịch hẹn:</h3>
                    <ul>
                        <li><strong>Số thứ tự:</strong> ${stt}</li> 
                        <li><strong>Ngày khám:</strong> ${formattedDate}</li>
                        <li><strong>Khung giờ:</strong> ${timeSlot}-${addMinutesToTime(timeSlot, 30)}</li>
                        <li><strong>Địa chỉ phòng khám:</strong> ${addressHospital}</li>
                        <li><strong>Lý do khám:</strong> ${reason || 'Không có ghi chú'}</li>
                    </ul>
                    <p>Vui lòng đến đúng giờ và mang theo các giấy tờ cần thiết nếu có.</p>
                    <p style="color: #888;">Đây là email tự động, vui lòng không trả lời email này.</p>
                    <hr />
                    <p style="font-size: 12px;">Hệ thống đặt lịch hẹn khám bệnh @Medicare</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Đã gửi email xác nhận đến: ${email}`);
        } catch (error) {
            console.error('❌ Lỗi gửi email:', error);
            return {
                status: 'error',
                message: 'Gửi email thất bại: ' + error.message
            };
        }
    }
    sendResetPasswordEmail = async (email, resetToken) => {
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
            subject: 'Yêu cầu đặt lại mật khẩu',
            html: `
                <h1>Đặt lại mật khẩu</h1>
                <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
                <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}">Đặt lại mật khẩu</a>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Đã gửi email đặt lại mật khẩu đến: ${email}`);
        } catch (error) {
            console.error('❌ Lỗi gửi email:', error);
            return {
                status: 'error',
                message: 'Gửi email thất bại: ' + error.message
            };
        }
    }
}
module.exports = new MailService();