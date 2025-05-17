const DoctorService = require('../services/DoctorService');
class DoctorController {
    addDoctor = async (req, res) => {
        try {
            const { name, email, password, phone, address, specialtyId, hospitalId, position, qualification, experience, description } = req.body;
            const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
            const emailRegex = /\S+@\S+\.\S+/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            const validEmail = emailRegex.test(email);
            const validPhone = phoneRegex.test(phone);
            if (!email || !password || !phone || !specialtyId, !hospitalId , !qualification) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            } else if (!validEmail) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email không đúng định dạng'
                });


            } else if (!validPhone) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Số điện thoại không đúng định dạng'
                });
            }
            const data = await DoctorService.addDoctor(req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    updateDoctor = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, password, phone, address, specialtyId, hospitalId, position, qualification, experience, description } = req.body;
            if (!name || !email || !password || !phone || !hospitalId || !specialtyId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            }
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id'
                });
            }
            const data = await DoctorService.updateDoctor(id, req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}
module.exports = new DoctorController();