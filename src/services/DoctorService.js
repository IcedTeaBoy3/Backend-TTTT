const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
class DoctorService {
    createDoctor = async (data) => {
        try {
            const { name, email, password, phone, address, specialties, hospitalId, position, qualification , yearExperience, description} = data;
            const hashPassword = await bcrypt.hash(password, 10);
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return {
                    status: 'error',
                    message: 'Email đã tồn tại'
                };
            }
            const user = await User.create({
                name,
                email,
                password: hashPassword,
                phone,
                address,
                role: 'doctor',
                isVerified: true
            });
            if (!user) {
                return {
                    status: 'error',
                    message: 'Tạo tài khoản bác sĩ thất bại'
                };
            }
            const doctor = await Doctor.create({
                user: user._id,
                specialties: JSON.parse(specialties) || [],
                hospital: hospitalId,
                position,
                qualification,
                yearExperience,
                description
            });
            return {
                status: 'success',
                message: 'Thêm bác sĩ thành công',
                data: doctor
            };
        } catch (error) {
            throw error;
        }
    }
    updateDoctor = async (id, data) => {
        try {
            const {
                name,
                email,
                phone,
                address,
                avatar,
                specialties,
                hospitalId,
                position = '',
                qualification  = 'Cử nhân',
                yearExperience = 0,
                description = ''
            } = data;

            // Lấy doctor trước
            const doctor = await Doctor.findById(id).populate("user");
            if (!doctor) {
                return {
                    status: "error",
                    message: "Không tìm thấy bác sĩ"
                };
            }

            const user = await User.findById(doctor.user);
            if (!user) {
                return {
                    status: "error",
                    message: "Không tìm thấy tài khoản người dùng"
                };
            }

            // Kiểm tra nếu email mới khác và bị trùng
            if (email && email !== user.email) {
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return {
                        status: "error",
                        message: "Email đã tồn tại"
                    };
                }
            }

            // Cập nhật user
            user.name = name || user.name; 
            user.email = email || user.email; 
            user.phone = phone || user.phone;
            user.address = address || user.address;
            user.avatar = avatar || user.avatar;

            await user.save();

            // Cập nhật doctor
            doctor.specialties = JSON.parse(specialties) || [];
            doctor.hospital = hospitalId;
            doctor.position = position;
            doctor.qualification = qualification;
            doctor.yearExperience = yearExperience;
            doctor.description = description;

            await doctor.save();
            await doctor.populate('user', 'name email phone address avatar');
            await doctor.populate('specialties', 'name description');
            await doctor.populate('hospital');
            

            return {
                status: "success",
                message: "Cập nhật bác sĩ thành công",
                data: doctor
            };
        } catch (error) {
            console.error(error);
            return {
                status: "error",
                message: "Đã xảy ra lỗi khi cập nhật bác sĩ"
            };
        }
    };
    deleteDoctor = async (id) => {
        try {
            const doctor = await Doctor.findByIdAndDelete(id);
            if (!doctor) {
                return {
                    status: 'error',
                    message: 'Xóa bác sĩ thất bại'
                };
            }
            await User.findByIdAndDelete(doctor.user);
            return {
                status: 'success',
                message: 'Xóa bác sĩ thành công'
            };
        } catch (error) {
            throw error;
        }
    }
    getAllDoctors = async (data) => {
        try {
            const { page, limit,isHospitalNotNull,specialty,qualification,searchValue } = data;
            const skip = (page - 1) * limit;
            // Nếu isHospitalNotNull là true, chỉ lấy bác sĩ có bệnh viện
            const matchCondition = {};
            if (searchValue) {
                const regex = new RegExp(searchValue, 'i'); // Tạo biểu thức chính
                matchCondition.$or = [
                    { 'user.name': regex },
                    { 'user.email': regex },
                    { 'user.phone': regex },
                    { 'specialties.name': regex },
                    { 'hospital.name': regex },
                    { 'qualification': regex },
                    { 'position': regex },
                    { 'description': regex }
                ];
            }
            if (isHospitalNotNull) {
                matchCondition.hospital = { $ne: null };
            }
            if(specialty){
                matchCondition.specialties = { $in: [specialty] };
            }
            if (qualification) {
                matchCondition.qualification = qualification;
            }
            const doctors = await Doctor.find(matchCondition)
                .populate('user', 'name email phone address avatar')
                .populate('specialties', 'name')
                .populate('hospital', 'name')
                .skip(skip)
                .limit(limit);
            const total = await Doctor.countDocuments(matchCondition);
            return {
                status: 'success',
                message: 'Lấy danh sách bác sĩ thành công',
                data: doctors,
                total
            };
        } catch (error) {
            throw error;
        }
    }
    getDoctor = async (id) => {
        try {
            const doctor = await Doctor.findById(id)
                .populate('user')
                .populate('specialties', 'name description image')
                .populate('hospital');
            if (!doctor) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy bác sĩ'
                };
            }
            return {
                status: 'success',
                message: 'Lấy thông tin bác sĩ thành công',
                data: doctor
            };
        } catch (error) {
            throw error;
        }
    }
    deleteManyDoctors = async (ids) => {
        try {
             // Tìm các doctor cần xóa
            const doctors = await Doctor.find({ _id: { $in: ids } });
            if (!doctors) {
                return {
                    status: 'error',
                    message: 'Xóa bác sĩ thất bại'
                };
            }
            // Lấy danh sách userId tương ứng
            const userIds = doctors.map(doctor => doctor.user);
            // Xóa các doctor
            await Doctor.deleteMany({ _id: { $in: ids } });
            // Xóa các user tương ứng
            await User.deleteMany({ _id: { $in: userIds } });
            return {
                status: 'success',
                message: 'Xóa bác sĩ thành công'
            };
        } catch (error) {
            throw error;
        }
    }
    searchDoctors = async (data) => {
        try {
            const { keyword = '', specialty = '', pageNumber = 1, limitNumber = 10 } = data;
            
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo phần $match cho tìm kiếm
            const matchConditions = [
                { 'user.name': { $regex: keyword, $options: 'i' } },
                { 'specialties.name': { $regex: keyword, $options: 'i' } },
                { 'hospital.address': { $regex: keyword, $options: 'i' } },
                { 'description': { $regex: keyword, $options: 'i' } },
                { 'qualification': { $regex: keyword, $options: 'i' } },
                { 'position': { $regex: keyword, $options: 'i' } },
            ];

            // Nếu có truyền specialty ID, thêm điều kiện lọc
           const matchQuery = {
                $and: [
                    { $or: matchConditions }
                ]
            };

           
            // Pipeline chung
            const commonPipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $lookup: {
                        from: 'specialties',
                        localField: 'specialties',
                        foreignField: '_id',
                        as: 'specialties',
                    },
                },
                {
                    $lookup: {
                        from: 'hospitals',
                        localField: 'hospital',
                        foreignField: '_id',
                        as: 'hospital',
                    },
                },
                { $unwind: '$hospital' },
                { $match: matchQuery },
            ];
             if (specialty && mongoose.Types.ObjectId.isValid(specialty)) {
                matchQuery.$and.push({
                    'specialties._id': new mongoose.Types.ObjectId(specialty)
                });
            }


            // Lấy danh sách bác sĩ
            const doctors = await Doctor.aggregate([
                ...commonPipeline,
                { $skip: skip },
                { $limit: Number(limitNumber) },
            ]);

            // Lấy tổng số bác sĩ
            const totalCountAgg = await Doctor.aggregate([
                ...commonPipeline,
                { $count: 'total' },
            ]);
            const total = totalCountAgg[0]?.total || 0;

            return {
                status: 'success',
                message: 'Tìm kiếm bác sĩ thành công',
                data: doctors,
                total: total,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Đã xảy ra lỗi khi tìm kiếm bác sĩ: ' + error.message,
            };
        }
    }
    getDoctorByUserId = async (userId) => {
        try {
            const doctor = await Doctor.findOne({ user: userId })
                .populate('user')
                .populate('specialties', 'name description image')
                .populate('hospital');
            if (!doctor) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy bác sĩ'
                };
            }
            return {
                status: 'success',
                message: 'Lấy thông tin bác sĩ thành công',
                data: doctor
            };
        } catch (error) {
            throw error;
        }
    }
    getDoctorStatistics = async (data) => {
        try {
            const { doctorId, from, to } = data;
            if (!doctorId) {
                return {
                    status: 'error',
                    message: 'Vui lòng cung cấp doctorId'
                };
            }

            // Parse ngày
            const fromDate = new Date(from);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);

            // Lấy tất cả lịch trong khoảng để tái sử dụng
            const appointmentsInRange = await Appointment.find({
                doctor: doctorId
            }).populate('schedule', 'workDate');

            const isWithinRange = (date) => {
                const d = new Date(date);
                return d >= fromDate && d <= toDate;
            };

            const todayStr = new Date().toISOString().slice(0, 10);

            // Overview
            const todayCount = appointmentsInRange.filter(
                ap => ap.schedule?.workDate?.toISOString().slice(0, 10) === todayStr
            ).length;

            const monthCount = appointmentsInRange.filter(
                ap => isWithinRange(ap.schedule?.workDate)
            ).length;

            const completeCount = await Appointment.countDocuments({
                doctor: doctorId,
                status: 'completed'
            });

            const cancelCount = await Appointment.countDocuments({
                doctor: doctorId,
                status: 'cancelled'
            });

            // Chart Data (Group theo ngày khám)
            const chartData = await Appointment.aggregate([
                {
                    $match: {
                        doctor: new mongoose.Types.ObjectId(doctorId)
                    }
                },
                {
                    $lookup: {
                        from: 'workingschedules',
                        localField: 'schedule',
                        foreignField: '_id',
                        as: 'schedule'
                    }
                },
                { $unwind: '$schedule' },
                {
                    $match: {
                        'schedule.workDate': { $gte: fromDate, $lte: toDate }
                    }
                },
                {
                    $group: {
                        _id: '$schedule.workDate',
                        appointments: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        date: '$_id',
                        appointments: 1,
                        _id: 0
                    }
                },
                { $sort: { date: 1 } }
            ]);

            // Lịch hẹn gần đây
            const recentAppointments = await Appointment.find({
                doctor: doctorId
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('patient timeSlot status schedule')
                .populate('patient', 'name')
                .populate('schedule', 'workDate');

            return {
                status: 'success',
                message: 'Lấy thống kê bác sĩ thành công',
                data: {
                    overview: {
                        todayCount,
                        monthCount,
                        completeCount,
                        cancelCount
                    },
                    chartData: chartData.map(item => ({
                        ...item,
                        date: new Date(item.date).toLocaleDateString('vi-VN')
                    })),
                    recentAppointments: recentAppointments.map(ap => ({
                        patient: ap.patient.name,
                        time: `${ap.timeSlot} - ${new Date(ap.schedule?.workDate).toLocaleDateString('vi-VN')}`,
                        status: ap.status
                    }))
                }
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Đã xảy ra lỗi khi lấy thống kê bác sĩ: ' + error.message
            };
        }
    };

}
module.exports = new DoctorService();