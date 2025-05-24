const WorkingSchedule = require('../models/WorkingSchedule');
class WorkingScheduleService {
    getAllWorkingSchedules = async (data) => {
        try {
            const { pageNumber, limitNumber } = data;
            const skip = (pageNumber - 1) * limitNumber;
            const today = new Date(); // Ngày hiện tại (bao gồm cả giờ phút)
            // Xóa giờ, phút, giây để chỉ so sánh theo ngày
            today.setHours(0, 0, 0, 0);
            const total = await WorkingSchedule.countDocuments();
            const workingSchedules = await WorkingSchedule
            .find({
                workDate: { $gte: today }, // ✅ chỉ lấy từ hôm nay trở đi
            })
            .populate({
                path: 'doctor',
                populate: {
                    path: 'user', // populate user bên trong doctor
                },
            })
            .skip(skip)
            .limit(limitNumber);
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
            const { doctorId, workDate, startTime, endTime } = data;
            const newWorkingSchedule = new WorkingSchedule({
                doctor: doctorId,
                workDate,
                startTime,
                endTime
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
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0)); // Bắt đầu hôm nay
            const currentTimeStr = new Date().toTimeString().slice(0, 5); // Giờ hiện tại dạng HH:mm

            // B1: Lấy tất cả lịch từ hôm nay trở đi
            let workingSchedules = await WorkingSchedule.find({
                doctor: doctorId,
                workDate: { $gte: todayStart }
            });

            if (!workingSchedules || workingSchedules.length === 0) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch làm việc nào'
                };
            }

            // B2: Lọc lại trong code nếu lịch là hôm nay và endTime > current time
            workingSchedules = workingSchedules.filter(schedule => {
                const workDate = new Date(schedule.workDate);
                const isToday = workDate.toDateString() === new Date().toDateString();
                if (isToday) {
                    return schedule.endTime > currentTimeStr;
                }
                return true;
            });

            if (workingSchedules.length === 0) {
                return {
                    status: 'error',
                    message: 'Không còn lịch làm việc phù hợp (sau giờ hiện tại)'
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
            const { id, doctor, workDate, startTime, endTime } = data;
            console.log('data', data);
            
            const updatedWorkingSchedule = await WorkingSchedule.findByIdAndUpdate(id, {
                doctor,
                workDate,
                startTime,
                endTime
            }, { new: true });
            if (!updatedWorkingSchedule) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy lịch làm việc'
                }
            }
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
}
module.exports = new WorkingScheduleService();