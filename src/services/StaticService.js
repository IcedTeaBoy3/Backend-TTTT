const Appointment = require('../models/Appointment'); 
const Doctor = require('../models/Doctor');
const User = require('../models/User'); 
class StaticService {
    getAppointmentStats = async (dateFilter) => {
        try {
            // Lấy các số liệu chính
            const [totalAppointments, cancelledAppointments, completedAppointments, confirmedAppointments] = await Promise.all([
                Appointment.countDocuments(dateFilter),
                Appointment.countDocuments({ ...dateFilter, status: 'cancelled' }),
                Appointment.countDocuments({ ...dateFilter, status: 'completed' }),
                Appointment.countDocuments({ ...dateFilter, status: 'confirmed' })
            ]);
            // Tính tỷ lệ hoàn thành và huỷ
            const completionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(2) : 0;
            const cancellationRate = totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(2) : 0;
            return {
                status: 'success',
                data: {
                    totalAppointments,
                    cancelledAppointments,
                    completedAppointments,
                    confirmedAppointments,
                    pendingAppointments: totalAppointments - (cancelledAppointments + completedAppointments + confirmedAppointments),
                    cancellationRate,
                    completionRate,
                }
            };
        }catch (error){
            return {
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê tổng quan.'
            }
        }

    }
    getDoctorStats = async (dateFilter) => {
        try {
            // Giả sử bạn có model Doctor và Appointment để lấy thống kê
            const totalDoctors = await User.countDocuments({
                role: 'doctor',
            });
            const stats = await Appointment.aggregate([
            { $match: dateFilter },
            {
                $group: {
                _id: '$doctor',
                total: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                }
            },
            { $sort: { total: -1 } },
            {
                $lookup: {
                from: 'doctors',
                localField: '_id',
                foreignField: '_id',
                as: 'doctor'
                }
            },
            { $unwind: '$doctor' },
            {
                $lookup: {
                from: 'users',
                localField: 'doctor.user',
                foreignField: '_id',
                as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'specialties',
                    localField: 'doctor.specialty',
                    foreignField: '_id',
                    as: 'specialty'
                }
            },
            { $unwind: '$specialty' },
            {
                $project: {
                    doctorId: '$_id',
                    doctorName: '$user.name',
                    specialty: '$specialty.name',
                    totalAppointments: '$total',
                    completedAppointments: '$completed',
                    completionRate: {
                        $round: [{ $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 2]
                    }
                }
            }
            ]);

            return {
                status: 'success',
                data: {
                    totalDoctors,
                    stats
                }
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê bác sĩ.'
            };
        }
    }
    getAppointmentTrend = async (data) => {
        try {
            const { startDate, endDate, groupBy = 'day' } = data;
            const matchStage = {};
            if (startDate && endDate) {
                matchStage.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            let groupFormat;
            switch (groupBy) {
                case 'month':
                    groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
                    break;
                case 'year':
                    groupFormat = { year: { $year: '$createdAt' } };
                    break;
                default:
                    groupFormat = { 
                        year: { $year: '$createdAt' }, 
                        month: { $month: '$createdAt' }, 
                        day: { $dayOfMonth: '$createdAt' } 
                    };
            }
            const stats = await Appointment.aggregate([
            { $match: matchStage },
            {
                $group: {
                _id: groupFormat,
                total: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            const formattedStats = stats.map(item => {
                let dateLabel;
                const { year, month, day } = item._id;

                if (groupBy === 'year') {
                    dateLabel = `Năm ${year}`;
                } else if (groupBy === 'month') {
                    dateLabel = `Tháng ${month}/${year}`;
                } else {
                    dateLabel = `${day}/${month}/${year}`;
                }

                return {
                    date: dateLabel,
                    count: item.total,
                    completed: item.completed
                };
            });
            return {
                status: 'success',
                data: formattedStats
            };
            
        } catch (error) {
            return {
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê xu hướng lịch hẹn.'
            };
        }
    }
    getPatientOverviewStats = async () => {
        try {

            const [
                totalPatients,
                patientsByGender,
                patientsActiveAccounts
            ] = await Promise.all([
                // Tổng số bệnh nhân
                User.countDocuments(
                    { 
                        role: 'patient',
                        isVerified: true
                    }
                ),
                
                // Phân bổ giới tính
                User.aggregate([
                    { $match: { role: 'patient' } }, // Chỉ lấy bệnh nhân
                    { $group: { _id: '$gender', count: { $sum: 1 } } }
                ]),
                
                // Bệnh nhân đã kích hoạt tài khoản
                User.countDocuments({ isVerified: true, role: 'patient' }),
            ]);
            return {
                status: 'success',
                data: {
                    totalPatients,
                    genderDistribution: patientsByGender.map((curr) => {
                        let label = 'Không rõ';
                        if (curr._id === 'male') label = 'Nam';
                        else if (curr._id === 'female') label = 'Nữ';
                        return {
                            type: label,
                            value: curr.count
                        };
                    }),
                    patientsActiveAccounts,
                }
            }
        }catch (error) {
            return {
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê tổng quan bệnh nhân.'
            };
        }
    }
}
module.exports = new StaticService();