const Appointment = require('../models/Appointment');
const WorkingSchedule = require ('../models/WorkingSchedule');
const MailService = require('./MailService');
const { generateTimeSlots } = require('../utils/timeUtils');
class AppointmentService {
    createAppointment = async (data) => {
        try {
            // Lấy tất cả lịch hẹn đã được đặt cho bác sĩ trong ngày đó
            const appointments = await Appointment.find({
                doctor: data.doctor,
                schedule: data.schedule
            });
            const schedule = await WorkingSchedule.findById(data.schedule);
            // Các khung giờ đã được đặt
            const bookedSlots = appointments.map(a => a.timeSlot);
            
            // Tạo danh sách khung giờ hợp lệ trong ngày (ví dụ: 08:00 đến 17:00)
            const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime, 30);
            
            // Lọc ra các khung giờ còn trống
            const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
            // Nếu không có khung giờ nào còn trống, trả về thông báo lỗi
            if (availableSlots.length === 0) {
                return {
                    status: 'error',
                    message: 'Không còn khung giờ nào trống trong ngày này',
                    availableSlots 
                };
            }

            // Kiểm tra xem khung giờ người dùng chọn còn trống không
            if (!availableSlots.includes(data.timeSlot)) {
                return {
                    status: 'error',
                    message: 'Khung giờ này đã được đặt, vui lòng chọn khung giờ khác',
                    availableSlots // Gửi danh sách khung giờ còn trống để phía frontend có thể dùng
                };
            }

            // Tạo mới lịch hẹn
            const appointment = new Appointment(data);
            const savedAppointment = await appointment.save();
            
           const populatedAppointment = await appointment.populate([
                { path: 'patient', select: 'name email' },
                {
                    path: 'doctor',
                    populate: [
                        { path: 'user', select: 'name email' },
                        { path: 'specialty', select: 'name description' },
                        { path: 'hospital', select: 'name address' }
                    ],
                    select: 'user specialty hospital'
                },
                { path: 'schedule', select: 'workDate startTime endTime' }
            ]);

            // Kiểm tra dữ liệu trước khi dùng
            const patientEmail = populatedAppointment?.patient?.email;
            const patientName = populatedAppointment?.patient?.name;
            const doctorName = populatedAppointment?.doctor?.user?.name;
            const hospitalAddress = populatedAppointment?.doctor?.hospital?.address;
            const scheduleDate = populatedAppointment?.schedule?.workDate;
            const timeSlot = populatedAppointment?.timeSlot;
            const reason = populatedAppointment?.reason;

            // Gửi email nếu dữ liệu hợp lệ
            if (patientEmail && doctorName && hospitalAddress && scheduleDate) {
                await MailService.sendBookingSuccessEmail(patientEmail, {
                    patientName,
                    doctorName,
                    addressHospital: hospitalAddress,
                    scheduleDate,
                    timeSlot,
                    reason
                });
            } else {
                return {
                    status: 'error',
                    message: 'Không thể gửi email xác nhận do thiếu thông tin cần thiết'
                }
            }
            return {
                status: 'success',
                message: 'Lịch hẹn đã được tạo thành công',
                data: savedAppointment
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };
    getAllAppointments = async ({ page = 1, limit = 10 }) => {
        try {
            const skip = (page - 1) * limit;
            const appointments = await Appointment.find()
                .skip(skip)
                .limit(limit)
                .select('patient doctor schedule timeSlot reason createdAt')
                .populate('patient', 'name')
                .populate({
                    path: 'doctor',
                    select: 'user specialty',
                    populate: [
                        { path: 'user', select: 'name email' },
                        { path: 'specialty', select: 'name description' },
                    ]
                })
                .populate('schedule', 'workDate startTime endTime')
                .sort({ createdAt: -1 })
                .lean(); // ⚡️ tối ưu hiệu suất đọc

            const totalAppointments = await Appointment.countDocuments();
            return {
                status: 'success',
                message: 'Lấy danh sách lịch hẹn thành công',
                data: appointments,
                total: totalAppointments,
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };
}
module.exports = new AppointmentService();