const Specialty = require('../models/Specialty');
class SpecialtyService {
    createSpecialty = async (data) => {
        try {
            const { name, description, image } = data;
            const newSpecialty = await Specialty.create({
                name: name,
                description: description,
                image: image,
            });
            if (newSpecialty) {
                return {
                    status: 'success',
                    message: 'Tạo chuyên khoa thành công',
                    data: newSpecialty,
                };
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    };
    getSpecialty = async (id) => {
        try {
            const specialty = await Specialty.findById(id);
            if (!specialty) {
                return {
                    status: 'error',
                    message: 'Chuyên khoa không tồn tại',
                };
            }
            return {
                status: 'success',
                message: 'Lấy thông tin chuyên khoa thành công',
                data: specialty,
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    };
    getAllSpecialties = async () => {
        try {
            const specialties = await Specialty.find();
            return {
                status: 'success',
                message: 'Lấy danh sách chuyên khoa thành công',
                data: specialties,
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    };
    updateSpecialty = async (id, data) => {
        try {
            const specialty = await Specialty.findByIdAndUpdate(id, data, {
                new: true,
            });
            if (!specialty) {
                return {
                    status: 'error',
                    message: 'Chuyên khoa không tồn tại',
                };
            }
            return {
                status: 'success',
                message: 'Cập nhật chuyên khoa thành công',
                data: specialty,
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    };
    deleteSpecialty = async (id) => {
        try {
            const specialty = await Specialty.findByIdAndDelete(id);
            if (!specialty) {
                return {
                    status: 'error',
                    message: 'Chuyên khoa không tồn tại',
                };
            }
            return {
                status: 'success',
                message: 'Xóa chuyên khoa thành công',
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    };
}
module.exports = new SpecialtyService();