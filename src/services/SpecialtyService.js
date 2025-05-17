const Specialty = require('../models/Specialty');
const fs = require('fs');
const path = require('path');
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
            const { name, description, image } = data;
            const specialty = await Specialty.findById(id);
            
            if (!specialty) {
                return {
                    status: 'error',
                    message: 'Chuyên khoa không tồn tại',
                };
            }
            if(image){
                const oldImagePath = path.join(__dirname, '../../public', specialty?.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Lỗi khi xóa ảnh:', err);
                    }
                });
                // Cập nhật thông tin chuyên khoa
                await Specialty.findByIdAndUpdate(id, {
                    image: image,
                },{new: true});
            }
            const newSpecialty = await Specialty.findByIdAndUpdate(id, {
                name: name,
                description: description,
            }, { new: true });
            
            return {
                status: 'success',
                message: 'Cập nhật chuyên khoa thành công',
                data: newSpecialty,
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
            const specialty = await Specialty.findById(id);
            if (!specialty) {
                return {
                    status: 'error',
                    message: 'Chuyên khoa không tồn tại',
                };
            }
            // Xóa file ảnh
            if (specialty.image) {
                const filePath = path.join(__dirname, '../../public', specialty.image);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Lỗi khi xóa ảnh:', err);
                    }
                });
            }
            // Xóa chuyên khoa
            await Specialty.findByIdAndDelete(id);
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
    deleteManySpecialties = async (ids) => {
        try {
            const specialties = await Specialty.find({ _id: { $in: ids } });
            if (!specialties || specialties.length === 0) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy chuyên khoa nào',
                };
            }
            // Xóa file ảnh
            specialties.forEach((specialty) => {
                if (specialty.image) {
                    const filePath = path.join(__dirname, '../../public', specialty.image);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Lỗi khi xóa ảnh:', err);
                        }
                    });
                }
            });
            // Xóa chuyên khoa
            await Specialty.deleteMany({ _id: { $in: ids } });
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