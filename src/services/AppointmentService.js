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
            // Kiểm tra ngày xem có nhỏ hơn ngày hiện tại không
            if (new Date(schedule.workDate) < new Date()) {
                return {
                    status: 'error',
                    message: 'Ngày làm việc không hợp lệ, vui lòng chọn ngày trong tương lai',
                    availableSlots: [] // Trả về mảng rỗng để phía frontend có thể hiển thị
                };
            }
            // Các khung giờ đã được đặt
            const bookedSlots = appointments.map(a => a.timeSlot);
            
            // Tạo danh sách khung giờ hợp lệ trong ngày mặc định ca làm việc 30p
            const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime);
            
            // Lọc ra các khung giờ còn trống
            const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
            // Nếu không có khung giờ nào còn trống, trả về thông báo lỗi
            if (availableSlots.length === 0 || !availableSlots) {
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
            const appointment = new Appointment({
                patient: data.patient,
                doctor: data.doctor,
                schedule: data.schedule,
                timeSlot: data.timeSlot,
                reason: data.reason,
                stt: appointments.length + 1, // Số thứ tự của lịch hẹn
            });
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
            const stt = populatedAppointment?.stt;

            // Gửi email nếu dữ liệu hợp lệ
            if (patientEmail && doctorName && hospitalAddress && scheduleDate && stt) {
                await MailService.sendBookingSuccessEmail(patientEmail, {
                    patientName,
                    doctorName,
                    addressHospital: hospitalAddress,
                    scheduleDate,
                    timeSlot,
                    reason,
                    stt
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
                .select('patient doctor schedule timeSlot reason status createdAt')
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
    deleteAppointment = async (id) => {
        try {
            const appointment = await Appointment.findByIdAndDelete(id);
            if (!appointment) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch hẹn với ID này'
                };
            }
            return {
                status: 'success',
                message: 'Lịch hẹn đã được xoá thành công',
                data: appointment
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };
    updateAppointment = async (id, data) => {
        try {
            // Kiểm tra xem lịch hẹn có tồn tại không
            const existingAppointment = await Appointment.findById(id);
            if (!existingAppointment) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch hẹn với ID này'
                };
            }
            // Kiểm tra xem khung giờ mới có còn trống không
            const schedule = await WorkingSchedule.findById(data.schedule);
            const appointments = await Appointment.find({
                doctor: existingAppointment.doctor,
                schedule: data.schedule,
            })
            // Lịch hẹn đã được đặt
            const bookedSlots = appointments.map(a => a.timeSlot);
            // Tạo danh sách khung giờ hợp lệ trong ngày mặc định ca làm việc 30p
            const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime);
            // Lọc ra các khung giờ còn trống
            const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
            // Nếu không có khung giờ nào còn trống, trả về thông báo lỗi
            if (availableSlots.length === 0 || !availableSlots) {
                return {
                    status: 'error',
                    message: 'Không còn khung giờ nào trống trong ngày này',
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
            // Cập nhật lịch hẹn
            const appointment = await Appointment.findByIdAndUpdate(id, data, { new: true })

            return {
                status: 'success',
                message: 'Lịch hẹn đã được cập nhật thành công',
                data: appointment
            }

        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }

    
    }
    deleteManyAppointments = async (ids) => {
        try {
            const appointments = await Appointment.find({ _id: { $in: ids } });
            if (!appointments || appointments.length === 0) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch hẹn nào với các ID này'
                };
            }
            await Appointment.deleteMany({ _id: { $in: ids } });
            return {
                status: 'success',
                message: 'Đã xoá thành công các lịch hẹn',
                data: appointments
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };
    getAllAppointmentsByPatient = async (data) => {
        try {
            const { patientId, page , limit } = data;
            const skip = (page - 1) * limit;
            const appointments = await Appointment.find({ patient: patientId})
                .populate({
                    path: 'doctor',
                    select: 'user specialty hospital',
                    populate: [
                        { path: 'user', select: 'name' },
                        { path: 'specialty', select: 'name' },
                        { path: 'hospital', select: 'name address' }
                    ]
                })
                .skip(skip)
                .limit(limit)
                .populate('patient', 'name')
                .populate('schedule', 'workDate startTime endTime')
                .sort({ createdAt: -1 })
                .lean();

            const totalAppointments = await Appointment.countDocuments({ patient: patientId });
            return {
                status: 'success',
                message: 'Lấy danh sách lịch hẹn của bệnh nhân thành công',
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
    cancelAppointment = async (id) => {
        try {
            const appointment = await Appointment.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
            if (!appointment) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch hẹn với ID này'
                };
            }
            return {
                status: 'success',
                message: 'Lịch hẹn đã được huỷ thành công',
                data: appointment
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };
    confirmAppointment = async (id) => {
        try {
            const appointment = await Appointment.findByIdAndUpdate(id, { status: 'confirmed' }, { new: true });
            if (!appointment) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch hẹn với ID này'
                };
            }
            return {
                status: 'success',
                message: 'Lịch hẹn đã được xác nhận thành công',
                data: appointment
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
}
module.exports = new AppointmentService();