const Hospital = require('../models/Hospital');
const fs = require('fs/promises');
const path = require('path');
class HospitalService {
    createHospital = async (data) => {
        try {
            const { name, address, phone, description, image, doctors, specialties, type } = data;
            let  dataCreate = {
                name,
                address,
                phone,
                description,
                image,
                type: type || 'hospital'
            };
            if(type !== 'clinic'){
                dataCreate.doctors = doctors || [];
                dataCreate.specialties = specialties || [];
            }


            const hospital = await Hospital.create(dataCreate);
            
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
            const { pageNumber, limitNumber,type } = data;
            const skip = (pageNumber - 1) * limitNumber;
            let query = {};
            if (type) {
                query.type = type; // Chỉ lấy bệnh viện hoặc phòng khám theo loại
            }
            // Đếm tổng bản ghi
            const total = await Hospital.countDocuments(query);
            const hospitals = await Hospital.find(query)
            .skip(skip)
            .limit(limitNumber)
            .populate({
                path: 'doctors',
                populate: {
                    path: 'user', // Nếu muốn populate tiếp từ Doctor -> User
                    select: 'name email'
                }
            })
            .populate('specialties')
            .exec();
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
            const { name, address, phone, description, image,doctors,specialties,type } = data;
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
            const updateData = { name, address, phone, description,doctors, specialties,type };
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
    searchHospital = async (data) => {
        try {
            const { keyword = '',specialty ='', pageNumber = 1, limitNumber = 10 } = data;
            const skip = (pageNumber - 1) * limitNumber;
            const query = {};
            if (keyword) {
                query.$or = [
                    { name: { $regex: keyword, $options: 'i' } },
                    { address: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } }
                ];
            }
            // Lọc theo chuyên khoa
            if (specialty) {
                query.specialties = specialty; // specialty là _id
            }
            query.type = 'hospital'; // Chỉ lấy bệnh viện, không lấy phòng khám
            const [hospitals, total] = await Promise.all([
                Hospital.find(query)
                    .populate('specialties')
                    .skip(skip)
                    .limit(parseInt(limitNumber)),
                Hospital.countDocuments(query),
            ]);
            return {
                status: 'success',
                message: 'Tìm kiếm bệnh viện thành công',
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
}
module.exports = new HospitalService();