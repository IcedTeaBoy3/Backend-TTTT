const HospitalService = require('../services/HospitalService');

class HospitalController {
    createHospital = async (req, res) => {
        try {
            const { name, address, phone, description, image } = req.body;
            const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
            const phoneValid = phoneRegex.test(phone);
            if (!phoneValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Số điện thoại không đúng định dạng'
                });
            }
            if (!name || !address || !phone || !description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin bệnh viện'
                });
            }
            const data = await HospitalService.createHospital(req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    getHospital = async (req, res) => {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id bệnh viện'
                });
            }
            const data = await HospitalService.getHospital(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    getAllHospital = async (req, res) => {
        try {
            const data = await HospitalService.getAllHospitals();
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    updateHospital = async (req, res) => {
        try {
            const id = req.params.id;
            const { name, address, phone, description, image } = req.body;
            const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
            const phoneValid = phoneRegex.test(phone);
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id bệnh viện'
                });
            }
            if (!name || !address || !phone || !description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin bệnh viện'
                });
            } else if (!phoneValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Số điện thoại không đúng định dạng'
                });
            }
            const data = await HospitalService.updateHospital(id, req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    deleteHospital = async (req, res) => {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id bệnh viện'
                });
            }
            const data = await HospitalService.deleteHospital(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    deleteManyHospitals = async (req, res) => {
        try {
            const ids = req.body.ids;
            if (!ids || ids.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp id bệnh viện'
                });
            }
            const data = await HospitalService.deleteManyHospitals(ids);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}
module.exports = new HospitalController();