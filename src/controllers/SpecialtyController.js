const AuthService = require('../services/AuthService');

class SpecialtyController {
    createSpecialty = async (req, res) => {
        try {
            const { name, description, image } = req.body;
            if (!name || !description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            }
            const data = await AuthService.createSpecialty(req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    getSpecialty = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID chuyên khoa'
                });
            }
            const data = await AuthService.getSpecialty(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    getAllSpecialties = async (req, res) => {
        try {
            const data = await AuthService.getAllSpecialties();
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    updateSpecialty = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID chuyên khoa'
                });
            }
            const data = await AuthService.updateSpecialty(id, req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    deleteSpecialty = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID chuyên khoa'
                });
            }
            const data = await AuthService.deleteSpecialty(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    deleteManySpecialties = async (req, res) => {
        try {
            const { ids } = req.body;
            if (!ids || ids.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID chuyên khoa'
                });
            }
            const data = await AuthService.deleteManySpecialties();
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}
module.exports = new SpecialtyController();