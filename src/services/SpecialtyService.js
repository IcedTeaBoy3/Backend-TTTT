const Specialty = require('../models/Specialty');
const { moveImageToBackup,restoreImageFromBackup,deleteImage } = require('../utils/imageUtils');
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
            const { pageNumber, limitNumber,status } = data;
            const skip = (pageNumber - 1) * limitNumber;
            let filter = {};
            if (status && ['active', 'inactive'].includes(status)) {
                filter.status = status;
            }
            // Đếm tổng bản ghi
            const total = await Specialty.countDocuments(filter);
            const specialties = await Specialty.find(filter)
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
            const { name, description, image, oldImage, status, isImageDeleted } = data;
            const specialty = await Specialty.findById(id);

            if (!specialty) {
                return {
                    status: 'error',
                    message: 'Chuyên khoa không tồn tại',
                };
            }

            const basePath = path.join(__dirname, '../../public');
            const updateData = { name, description };

            // Xử lý xoá ảnh nếu có cờ xoá
            if (isImageDeleted && specialty.image) {
                const oldImagePath = path.join(basePath, specialty.image);
                await deleteImage(oldImagePath);
                updateData.image = '';
            }

            // Nếu có ảnh mới → xoá ảnh cũ nếu khác và cập nhật ảnh mới
            if (image && image !== specialty.image) {
                if (specialty.image) {
                    const oldImagePath = path.join(basePath, specialty.image);
                    await deleteImage(oldImagePath);
                }
                updateData.image = image;
            }

            // Nếu không có ảnh mới và không xoá ảnh, giữ lại ảnh cũ
            if (!image && !isImageDeleted && oldImage) {
                updateData.image = oldImage;
            }

            // Cập nhật trạng thái nếu hợp lệ
            if (['active', 'inactive'].includes(status)) {
                updateData.status = status;
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
                await moveImageToBackup(specialty.image)
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
                    await moveImageToBackup(specialty.image);
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
            if (!Array.isArray(specialties) || specialties.length === 0) {
                return {
                    status: 'error',
                    message: 'Vui lòng cung cấp danh sách chuyên khoa hợp lệ',
                };
            }
            // Chuyển về thư mục uploads
            specialties.forEach(async (specialty) => {
                if (specialty.image) {
                    await restoreImageFromBackup(specialty.image);
                }
            });

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