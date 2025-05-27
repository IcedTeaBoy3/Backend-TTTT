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

}

module.exports = new AppointmentController();