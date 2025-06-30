const StaticService = require('../services/StaticService');
class StaticController {
    // 1. Thống kê tổng quan (dashboard)
    getAppointmentStats = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            if(!startDate || !endDate) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'Vui lòng cung cấp khoảng thời gian bắt đầu và kết thúc.'
                });
            }
            // Tạo filter theo khoảng ngày (nếu có)
            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            const data = await StaticService.getAppointmentStats(dateFilter);
            res.json(data);
        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê tổng quan.'
            });
        }
    };
    getDoctorOverviewStats = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            // Tạo filter theo khoảng ngày (nếu có)
            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            const data = await StaticService.getDoctorOverviewStats(dateFilter);
            res.json(data);

        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê bác sĩ.'
            });
        }
    }
    getDoctorStatsBySpecialty = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            // Tạo filter theo khoảng ngày (nếu có)
            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            const data = await StaticService.getDoctorStatsBySpecialty(dateFilter);
            res.json(data);
        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê bác sĩ theo chuyên khoa.'
            });
        }
    }
    getAppointmentTrend = async (req, res) => {
        try {
            const { startDate, endDate,groupBy = 'day' } = req.query;
            if(!startDate || !endDate) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'Vui lòng cung cấp khoảng thời gian bắt đầu và kết thúc.'
                });
            }
            // Tạo filter theo khoảng ngày (nếu có)
          
            const data = await StaticService.getAppointmentTrend({ startDate, endDate, groupBy });
            res.json(data);
        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê xu hướng lịch hẹn.'
            });
        }
    }
    getPatientOverviewStats = async (req, res) => {
        try {
            const data = await StaticService.getPatientOverviewStats();
            res.json(data);
        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                message: error.message || 'Lỗi khi lấy dữ liệu thống kê bệnh nhân.'
            });
        }
    }
}
module.exports = new StaticController();