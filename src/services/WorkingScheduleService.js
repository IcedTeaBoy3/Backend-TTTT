const WorkingSchedule = require('../models/WorkingSchedule');
const {isSameDay} = require('../utils/dateUtils'); // Giả sử bạn có một hàm isSameDay trong utils để so sánh ngày
class WorkingScheduleService {
    getAllWorkingSchedules = async (data) => {
        try {
            const { pageNumber, limitNumber } = data;
            const skip = (pageNumber - 1) * limitNumber;
            // const today = new Date(); // Ngày hiện tại (bao gồm cả giờ phút)
            // // Xóa giờ, phút, giây để chỉ so sánh theo ngày
            // today.setHours(0, 0, 0, 0);
            const total = await WorkingSchedule.countDocuments();
            const workingSchedules = await WorkingSchedule
            .find({})
            .populate({
                path: 'doctor',
                populate: {
                    path: 'user', // populate user bên trong doctor
                },
            })
            .skip(skip)
            .limit(limitNumber)
            .sort({ workDate: 1, startTime: 1 }); // Sắp xếp theo ngày làm việc và giờ bắt đầu
            if (!workingSchedules || workingSchedules.length === 0) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch làm việc nào'
                }
            }
            return {
                status: 'success',
                message: 'Lấy danh sách lịch làm việc thành công',
                data: workingSchedules,
                total: total,
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    createWorkingSchedule = async (data) => {
        try {
            const { doctorId, workDate, startTime, endTime, shiftDuration } = data;
            // Kiểm tra trùng lịch làm việc trong cùng ngày
            const existedSchedule = await WorkingSchedule.findOne({
                doctor: doctorId,
                workDate: {
                    $gte: new Date(new Date(workDate).setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date(workDate).setHours(23, 59, 59, 999))
                }
            });

            if (existedSchedule) {
                return {
                    status: 'error',
                    message: 'Bác sĩ đã có lịch làm việc trong ngày này!'
                };
            }
            const newWorkingSchedule = new WorkingSchedule({
                doctor: doctorId,
                workDate,
                startTime,
                endTime,
                shiftDuration: shiftDuration
            });
            await newWorkingSchedule.save();
            return {
                status: 'success',
                message: 'Tạo lịch làm việc thành công',
                data: newWorkingSchedule
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    getWorkingScheduleByDoctor = async (doctorId) => {
        try {
            
            // Kiểm tra xem lịch có nhỏ hơn ngày hiện tại không
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây về 0 để so sánh theo ngày

            const workingSchedules = await WorkingSchedule.find({
                doctor: doctorId,
                workDate: {
                    $gte: today // Lấy lịch làm việc từ ngày hôm nay trở đi
                }
            })
            .sort({ workDate: 1 }) // Sắp xếp theo ngày làm việc
            

            if (!workingSchedules || workingSchedules.length === 0) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch làm việc nào'
                };
            }

            return {
                status: 'success',
                message: 'Lấy danh sách lịch làm việc thành công',
                data: workingSchedules
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };
    updateWorkingSchedule = async (data) => {
        try {
            const { id, doctor, workDate, startTime, endTime,shiftDuration } = data;
            const workingSchedule = await WorkingSchedule.findById(id);
            if(!isSameDay(workingSchedule.workDate, workDate)) {
                const existedSchedule = await WorkingSchedule.findOne({
                    doctor: doctor,
                    workDate: {
                        $gte: new Date(new Date(workDate).setHours(0, 0, 0, 0)),
                        $lte: new Date(new Date(workDate).setHours(23, 59, 59, 999))
                    }
                });
    
                if (existedSchedule) {
                    return {
                        status: 'error',
                        message: 'Bác sĩ đã có lịch làm việc trong ngày này!'
                    };
                }
            }
            workingSchedule.doctor = doctor;
            workingSchedule.workDate = workDate;
            workingSchedule.startTime = startTime;
            workingSchedule.endTime = endTime;
            workingSchedule.shiftDuration = shiftDuration;
            const updatedWorkingSchedule = await workingSchedule.save();
            
            return {
                status: 'success',
                message: 'Cập nhật lịch làm việc thành công',
                data: updatedWorkingSchedule
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    deleteWorkingSchedule = async (id) => {
        try {
            const deletedWorkingSchedule = await WorkingSchedule.findByIdAndDelete(id);
            if (!deletedWorkingSchedule) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch làm việc'
                }
            }
            return {
                status: 'success',
                message: 'Xóa lịch làm việc thành công',
                data: deletedWorkingSchedule
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    deleteManyWorkingSchedules = async (ids) => {
        try {
            const deletedWorkingSchedules = await WorkingSchedule.deleteMany({ _id: { $in: ids } });
            if (deletedWorkingSchedules.deletedCount === 0) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch làm việc nào để xóa'
                }
            }
            return {
                status: 'success',
                message: 'Xóa nhiều lịch làm việc thành công',
                data: deletedWorkingSchedules
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
}
module.exports = new WorkingScheduleService();