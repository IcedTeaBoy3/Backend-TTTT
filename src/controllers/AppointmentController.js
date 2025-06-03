const AppointmentService = require('../services/AppointmentService');
class AppointmentController {
    createAppointment = async (req, res) => {
        try {
            const { patientId, doctorId, scheduleId, timeSlot,reason } = req.body;
            if (!patientId || !doctorId || !scheduleId || !timeSlot || !reason) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin' 
                });
            }
            const appointmentData = {
                patient: patientId,
                doctor: doctorId,
                schedule: scheduleId,
                timeSlot,
                reason
            };
            const data = await AppointmentService.createAppointment(appointmentData);
            return res.json(data)
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }

    }
    getAllAppointments = async (req, res) => {
        try {
            const { page, limit } = req.query;
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 10;
            const appointments = await AppointmentService.getAllAppointments({
                page: pageNumber,
                limit: limitNumber
            });
            return res.json(appointments);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
    deleteAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'ID không được để trống' 
                });
            }
            const data = await AppointmentService.deleteAppointment(id);
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
    updateAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            const { patientId, doctorId, scheduleId, timeSlot, reason } = req.body;
            if (!id || !patientId || !doctorId || !scheduleId || !timeSlot || !reason) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Vui lòng điền đầy đủ thông tin' 
                });
            }
            const appointmentData = {
                patient: patientId,
                doctor: doctorId,
                schedule: scheduleId,
                timeSlot,
                reason
            };
            const data = await AppointmentService.updateAppointment(id, appointmentData);
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
    deleteManyAppointments = async (req, res) => {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Vui lòng cung cấp danh sách ID hợp lệ' 
                });
            }
            const data = await AppointmentService.deleteManyAppointments(ids);
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
    getAllAppointmentsByPatient = async (req, res) => {
        try {
            const { patientId } = req.params;
            const { page, pageSize } = req.query;
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(pageSize) || 5;

            if (!patientId) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'ID bệnh nhân không được để trống' 
                });
            }
            const appointments = await AppointmentService.getAllAppointmentsByPatient({
                patientId,
                page: pageNumber,
                limit: limitNumber
            });
            return res.json(appointments);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
    cancelAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Vui lòng cung cấp ID của cuộc hẹn cần hủy' 
                });
            }
            const data = await AppointmentService.cancelAppointment(id);
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
    confirmAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Vui lòng cung cấp ID của cuộc hẹn cần xác nhận' 
                });
            }
            const data = await AppointmentService.confirmAppointment(id);
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }
}

module.exports = new AppointmentController();