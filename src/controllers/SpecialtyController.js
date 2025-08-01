const SpecialtyService = require('../services/SpecialtyService');
class SpecialtyController {
    createSpecialty = async (req, res) => {
        try {
            const { name, description } = req.body;
            const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

            if (!name || !description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin.'
                });
            }
            
            const data = await SpecialtyService.createSpecialty({
                name,
                description,
                image: imagePath,
            });

            return res.json(data);

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message,
            });
        }
    };
    getSpecialty = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID chuyên khoa'
                });
            }
            const data = await SpecialtyService.getSpecialty(id);
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
            const { page, limit, status } = req.query;
            let pageNumber = parseInt(page);
            if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
            const limitNumber = parseInt(limit);
            const data = await SpecialtyService.getAllSpecialties({pageNumber,limitNumber,status});
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
            const { name, description,status,oldImage,isImageDeleted } = req.body;
            const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID chuyên khoa'
                });
            }
            if(!name || !description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            }
            const data = await SpecialtyService.updateSpecialty(id, {
                name,
                description,
                image:imagePath,
                isImageDeleted,
                oldImage,
                status
            });
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
            const data = await SpecialtyService.deleteSpecialty(id);
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
            const data = await SpecialtyService.deleteManySpecialties(ids);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    insertManySpecialties = async (req, res) => {
        try {
            const { specialties } = req.body;
            if (!specialties || specialties.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp danh sách chuyên khoa'
                });
            }
            const data = await SpecialtyService.insertManySpecialties(specialties);
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