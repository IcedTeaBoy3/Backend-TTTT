const Specialty = require('../models/Specialty');
const fs = require('fs/promises');
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
    getAllSpecialties = async (data) => {
        try {
            const { pageNumber, limitNumber } = data;
            const skip = (pageNumber - 1) * limitNumber;
            // Đếm tổng bản ghi
            const total = await Specialty.countDocuments();
            const specialties = await Specialty.find()
                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
                .exec();;
            return {
                status: 'success',
                message: 'Lấy danh sách chuyên khoa thành công',
                data: specialties,
                total: total,
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
            if(image && specialty.image){
                console.log('specialty.image', specialty.image);
                
                const oldImagePath = path.join(__dirname, '../../public', specialty?.image);
                try {
                    await fs.unlink(oldImagePath);
                    console.log('Old image deleted successfully');
                } catch (err) {
                    console.error('Error deleting old image:', err.message);
                }
            }
            const updateData= { name, description };
            if (image) {
                updateData.image = image;
            }
            const updatedSpecialty = await Specialty.findByIdAndUpdate(id, updateData, { new: true });
            return {
                status: 'success',
                message: 'Cập nhật chuyên khoa thành công',
                data: updatedSpecialty,
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
            if (specialty.image && specialty) {
                const oldImagePath = path.join(__dirname, '../../public', specialty.image);
                fs.unlink(oldImagePath, (err) => {
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
            specialties.forEach(async (specialty) => {
                if (specialty.image) {
                    const filePath = path.join(__dirname, '../../public', specialty.image);
                    try {
                        await fs.unlink(filePath)
                        console.log(`Đã xóa ảnh: ${filePath}`);
                    } catch (err){
                        console.error('Lỗi khi xóa ảnh:', err);
                    }
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
    insertManySpecialties = async (data) => {
        try {
            const specialties = data;
            console.log('specialties', specialties);
            
            if (!Array.isArray(specialties) || specialties.length === 0) {
                return {
                    status: 'error',
                    message: 'Vui lòng cung cấp danh sách chuyên khoa hợp lệ',
                };
            }
            const createdSpecialties = await Specialty.insertMany(specialties);
            return {
                status: 'success',
                message: 'Thêm nhiều chuyên khoa thành công',
                data: createdSpecialties,
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