const DoctorService = require('../services/DoctorService');
class DoctorController {
    createDoctor = async (req, res) => {
        try {
            
            const { name, email, password, address, specialties, hospitalId, position, qualification, experience, description } = req.body;
            const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
            const emailRegex = /\S+@\S+\.\S+/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            const validEmail = emailRegex.test(email);
            // const validPhone = phoneRegex.test(phone);
            const validPassword = passwordRegex.test(password);
            if (!name|| !email || !password  || !specialties || !qualification) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            } else if (!validEmail) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email không đúng định dạng'
                });
            }else if (!validPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
                });
            }
            const data = await DoctorService.createDoctor(req.body);
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
            const { name, email, phone, address, specialties, hospitalId, position, qualification, experience, description } = req.body;
            console.log(req.body);
            const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id'
                });
            }
            if (!name || !email || !specialties || !qualification) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            }
            const data = await DoctorService.updateDoctor(id, {
                name,
                email,
                phone,
                address,
                specialties,
                hospitalId,
                position,
                qualification,
                experience,
                description,
                avatar: avatarPath
            });
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    deleteDoctor = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id'
                });
            }
            const data = await DoctorService.deleteDoctor(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    getAllDoctors = async (req, res) => { 
        try {
            const { page, limit } = req.query;
            const pageNumber = parseInt(page) 
            const limitNumber = parseInt(limit)
            const data = await DoctorService.getAllDoctors({ page: pageNumber, limit: limitNumber });
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    getDoctor = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id'
                });
            }
            const data = await DoctorService.getDoctor(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    deleteManyDoctors = async (req, res) => {
        try {
            const { ids } = req.body;
            if (!ids || ids.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id'
                });
            }
            const data = await DoctorService.deleteManyDoctors(ids);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    searchDoctors = async (req, res) => {
        try {
            const { keyword, specialty , page, limit } = req.query;
            let pageNumber = parseInt(page)
            if (isNaN(pageNumber) || pageNumber < 1) {
                pageNumber = 1;
            }
            const limitNumber = parseInt(limit)
            const data = await DoctorService.searchDoctors({ keyword, specialty, pageNumber, limitNumber});
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    getDoctorByUserId = async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp userId'
                });
            }
            const data = await DoctorService.getDoctorByUserId(userId);
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