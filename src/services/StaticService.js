const Appointment = require('../models/Appointment'); 
const Doctor = require('../models/Doctor');
const User = require('../models/User'); 
const Specialty = require('../models/Specialty');
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
    getDoctorOverviewStats = async (dateFilter) => {
        try {
            // Giả sử bạn có model Doctor và Appointment để lấy thống kê
            const totalDoctors = await User.countDocuments({
                role: 'doctor',
            });
            const aggregateStats = await Appointment.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                    _id: '$doctor',
                        totalAppointments: { $sum: 1 },
                        completedAppointments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                        cancelledAppointments: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    }
                },
                {
                    $addFields: {
                        completionRate: {
                            $cond: [
                                { $gt: ['$totalAppointments', 0] },
                                { $divide: ['$completedAppointments', '$totalAppointments'] },
                                0
                            ]
                        },
                        cancellationRate: {
                            $cond: [
                                { $gt: ['$totalAppointments', 0] },
                                { $divide: ['$cancelledAppointments', '$totalAppointments'] },
                                0
                            ]
                        }
                    },

                },
                {$sort: { totalAppointments: -1 } },
                {$limit: 1}
            ]);
            const topDoctor = aggregateStats.length > 0 ? aggregateStats[0] : null;
            const totalAppointments = aggregateStats.reduce((acc, d) => acc + d.totalAppointments, 0);
            const totalCompleted = aggregateStats.reduce((acc, d) => acc + d.completedAppointments, 0);
            const totalCancelled = aggregateStats.reduce((acc, d) => acc + d.cancelledAppointments, 0);

            const averageCompletionRate = totalAppointments > 0
            ? Math.round((totalCompleted / totalAppointments) * 10000) / 100
            : 0;
            const averageCancellationRate = totalAppointments > 0
            ? Math.round((totalCancelled / totalAppointments) * 10000) / 100   
            : 0;

            let topDoctorInfo = null;
            if (topDoctor && topDoctor._id) {
                const doctor = await Doctor.findById(topDoctor._id).populate({
                    path: 'user',
                    select: 'name email avatar'
                }).populate('specialties', 'name');

                topDoctorInfo = {
                    name: doctor?.user?.name || 'Không rõ',
                    email: doctor?.user?.email || '',
                    avatar: doctor?.user?.avatar || '',
                    specialties: doctor?.specialties?.map(s => s.name) || [],
                    totalAppointments: topDoctor.totalAppointments,
                    completionRate: Math.round(topDoctor.completionRate * 10000) / 100,
                    cancellationRate: Math.round(topDoctor.cancellationRate * 10000) / 100
                };
            }
            return {
                status: 'success',
                message: 'Thống kê tổng quan bác sĩ thành công',
                data: {
                    totalDoctors,
                    totalAppointments,
                    totalCompleted,
                    totalCancelled,
                    averageCompletionRate,
                    averageCancellationRate,
                    topDoctor: topDoctorInfo,
                    
                }
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê bác sĩ.'
            };
        }
    }
    getDoctorStatsBySpecialty = async (dateFilter) => {
        try {
            // B1: Lấy thông tin bác sĩ và chuyên khoa
            const doctorData = await Doctor.aggregate([
                { $unwind: '$specialties' }, // Vì 1 bác sĩ có thể có nhiều chuyên khoa
                {
                    $group: {
                        _id: '$specialties',
                        doctorCount: { $sum: 1 },
                        doctorIds: { $addToSet: '$_id' }
                    }
                }
            ]);
            // B2: Lấy thông tin lịch hẹn theo chuyên khoa
            const appointmentData = await Appointment.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$specialty',
                        totalAppointments: { $sum: 1 },
                        completedAppointments: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        }
                    }
                }
            ]);
            // Map chuyên khoa lại để dễ kết hợp
            const appointmentMap = {};
            for (const item of appointmentData) {
                appointmentMap[item._id?.toString()] = item;
            }

            // B3: Gộp dữ liệu
            const result = [];
            for (const doc of doctorData) {
                const specId = doc._id?.toString();
                const appStats = appointmentMap[specId] || { totalAppointments: 0, completedAppointments: 0 };
                const completionRate =
                    appStats.totalAppointments > 0
                    ? Math.round((appStats.completedAppointments / appStats.totalAppointments) * 10000) / 100
                    : 0;

                const specialty = await Specialty.findById(doc._id).select('name');

                result.push({
                    specialtyId: doc._id,
                    specialtyName: specialty?.name || 'Không rõ',
                    doctorCount: doc.doctorCount,
                    totalAppointments: appStats.totalAppointments,
                    completedAppointments: appStats.completedAppointments,
                    completionRate
                });
            }
            return {
                status: 'success',
                message: 'Thống kê bác sĩ theo chuyên khoa thành công.',
                data: result
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê bác sĩ theo chuyên khoa.'
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
            const [total, verified, male, female, other] = await Promise.all([
                User.countDocuments({ role: 'patient' }),
                User.countDocuments({ role: 'patient', isVerified: true }),
                User.countDocuments({ role: 'patient', gender: 'male' }),
                User.countDocuments({ role: 'patient', gender: 'female' }),
                User.countDocuments({ role: 'patient',gender: 'other' }),
            ]);
            return {
                status: 'success',
                message: 'Thống kê tổng quan bệnh nhân thành công.',
                data: {
                    totalPatients: total,
                    verifiedPatients: verified,
                    unverifiedPatients: total - verified,
                    malePatients: male,
                    femalePatients: female,
                    otherPatients: other,
                    unknownPatients: total - male - female - other
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