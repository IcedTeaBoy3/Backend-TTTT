const Hospital = require('../models/Hospital');
const fs = require('fs/promises');
const path = require('path');
class HospitalService {
    createHospital = async (data) => {
        try {
            const { name, address, phone, description, image } = data;
            const hospital = await Hospital.create({
                name,
                address,
                phone,
                description,
                image
            });
            
            return {
                status: 'success',
                message: 'Tạo bệnh viện thành công',
                data: hospital
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    getHospital = async (id) => {
        try {
            const hospital = await Hospital.findById(id);
            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            return {
                status: 'success',
                message: 'Lấy thông tin bệnh viện thành công',
                data: hospital
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    getAllHospitals = async (data) => {
        try {
            const { pageNumber, limitNumber } = data;
            const skip = (pageNumber - 1) * limitNumber;
            // Đếm tổng bản ghi
            const total = await Hospital.countDocuments();
            const hospitals = await Hospital.find().skip(skip).limit(limitNumber).exec();
            return {
                status: 'success',
                message: 'Lấy danh sách bệnh viện thành công',
                data: hospitals,
                total: total
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    updateHospital = async (id, data) => {
        try {
            const { name, address, phone, description, image } = data;
            const hospital = await Hospital.findById(id);
            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            if(image && hospital.image){
                const oldImagePath = path.join(__dirname, '../../public', hospital.image);
                try {
                    await fs.unlink(oldImagePath);
                    console.log('Old image deleted successfully');
                } catch (err) {
                    console.error('Error deleting old image:', err.message);
                }
            }
             const updateData = { name, address, phone, description };
            if (image) {
                updateData.image = image;
            }
            const updatedHospital = await Hospital.findByIdAndUpdate(id, updateData, { new: true });
            return {
                status: 'success',
                message: 'Cập nhật bệnh viện thành công',
                data: updatedHospital
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    deleteHospital = async (id) => {
        try {
            const hospital = await Hospital.findById(id);
            if (hospital && hospital.image) {
                const oldImagePath = path.join(__dirname, '../../public', hospital.image);
                try {
                    await fs.unlink(oldImagePath);
                    console.log('Old image deleted successfully');
                } catch (err) {
                    console.error('Error deleting old image:', err.message);
                }
            }
            // Xóa bệnh viện
            await Hospital.findByIdAndDelete(id);
            
            return {
                status: 'success',
                message: "Xóa bệnh viện thành công",
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    deleteManyHospitals = async (ids) => {
        try {
            const hospitals = await Hospital.find({ _id: { $in: ids } });
            if (!hospitals || hospitals.length === 0) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            // Xóa ảnh của các bệnh viện
            hospitals.forEach(async (hospital) => {
                if (hospital.image) {
                    const oldImagePath = path.join(__dirname, '../../public', hospital.image);
                    try {
                        await fs.unlink(oldImagePath);
                        console.log('Old image deleted successfully');
                    } catch (err) {
                        console.error('Error deleting old image:', err.message);
                    }
                }
            });
            // Xóa các bệnh viện
            await Hospital.deleteMany({ _id: { $in: ids } });

            return {
                status: 'success',
                message: "Xóa bệnh viện thành công",
                data: hospitals
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
}
module.exports = new HospitalService();