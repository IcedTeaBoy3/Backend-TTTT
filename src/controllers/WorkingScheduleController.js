const WorkingScheduleService = require('../services/WorkingScheduleService');
class WorkingScheduleController {
    getAllWorkingSchedules = async (req, res) => {
        try {
            const { page, limit } = req.query;
            const pageNumber = parseInt(page); 
            const limitNumber = parseInt(limit);
            const data = await WorkingScheduleService.getAllWorkingSchedules({
                pageNumber,
                limitNumber,
            });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                
            });
        }
    }
    createWorkingSchedule = async (req, res) => {
        try {
            const { doctorId,workDate, startTime, endTime, shiftDuration } = req.body;
            if (!doctorId || !workDate || !startTime || !endTime || !shiftDuration) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp đầy đủ thông tin',
                });
            }
            console.log('doctorId workDate startTime endTime shiftDuration', doctorId, workDate, startTime, endTime, shiftDuration);
            const data = await WorkingScheduleService.createWorkingSchedule({
                doctorId,
                workDate,
                startTime,
                endTime,
                shiftDuration
            });
            return res.json(data)
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                
            });
        }
    }
    getWorkingScheduleByDoctor = async (req, res) => {
        try {
            const { doctorId } = req.params;
            if (!doctorId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp đầy đủ thông tin',
                });
            }
            const data = await WorkingScheduleService.getWorkingScheduleByDoctor(doctorId);
            return res.json(data)
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                
            });
        }
    }
    updateWorkingSchedule = async (req, res) => {
        try {
            const { id } = req.params;
            const { doctor,workDate, startTime, endTime,shiftDuration,status } = req.body;
            if (!id || !workDate || !startTime || !endTime|| !doctor || !shiftDuration) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp đầy đủ thông tin',
                });
            }
            const data = await WorkingScheduleService.updateWorkingSchedule({
                id,
                doctor,
                workDate,
                startTime,
                endTime,
                shiftDuration,
                status
            });
            return res.json(data)
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                
            });
        }
    }
    deleteWorkingSchedule = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp đầy đủ thông tin',
                });
            }
            const data = await WorkingScheduleService.deleteWorkingSchedule(id);
            return res.json(data)
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                
            });
        }
    }
    deleteManyWorkingSchedules = async (req, res) => {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp danh sách ID hợp lệ',
                });
            }
            const data = await WorkingScheduleService.deleteManyWorkingSchedules(ids);
            return res.json(data);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
                
            });
        }
    }
}
module.exports = new WorkingScheduleController();