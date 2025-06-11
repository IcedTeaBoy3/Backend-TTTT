const Hospital = require('../models/Hospital');
const {deleteFile} = require('../utils/deleteFile');
const path = require('path');
class HospitalService {
    createHospital = async (data) => {
        try {
            const { name, address, phone, description, thumbnail, images, doctors, specialties, type } = data;
            let dataCreate = {
                name,
                address,
                phone,
                description,
                thumbnail,
                images,
                type: type,
                doctors,
                specialties
            };

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
            const hospital = await Hospital.findById(id)
                .populate('specialties', 'name description image')
                .populate({
                    path: 'doctors',
                    populate: [
                        {
                            path: 'user',
                            select: 'name email phone address image'
                        },
                        {
                            path: 'specialties',
                            select: 'name description image'
                        }
                    ]
                });
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
            const { name, address, phone, description, thumbnail, images,doctors,specialties,type } = data;
            const hospital = await Hospital.findById(id);
            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            // Xoá ảnh cũ nếu có
            const basePath = path.join(__dirname, '../../public');
            const deleteTasks = [];
            if(thumbnail && hospital.thumbnail && thumbnail !== hospital.thumbnail) {
                const thumbnailPath = path.join(basePath, hospital.thumbnail);
                deleteTasks.push(deleteFile(thumbnailPath));
            }
            console.log('images', images);
            console.log('hospital.images', hospital.images);
            if (Array.isArray(images) && Array.isArray(hospital.images)) {
                const removedImages = hospital.images.filter(old => !images.includes(old));
                removedImages.forEach(image => {
                    const imagePath = path.join(basePath, image);
                    deleteTasks.push(deleteFile(imagePath));
                });
            }

            const updateData = { name, address, phone, description,doctors, specialties,type };
            if (thumbnail) updateData.thumbnail = thumbnail;
            if (Array.isArray(images)) updateData.images = images;

            // Chờ tất cả các tác vụ xoá ảnh hoàn thành hoặc dừng nếu có 1 cái thất bại
            await Promise.all(deleteTasks);
            // Cập nhật bệnh viện
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
            if(!hospital){
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            const basePath = path.join(__dirname, '../../public');
            const deleteTasks = [];
            // Xoá ảnh đại diện
            if(hospital.thumbnail){
                const thumbnailPath = path.join(basePath, hospital.thumbnail);
                deleteTasks.push(deleteFile(thumbnailPath));
            }
            // Xoá các ảnh khác
            if(Array.isArray(hospital.images) && hospital.images.length > 0) {
                hospital.images.forEach(image => {
                    const imagePath = path.join(basePath, image);
                    deleteTasks.push(deleteFile(imagePath));
                });
            }
            // Chờ tất cả các tác vụ xoá ảnh hoàn thành hoặc dừng nếu có 1 cái thất bại
            await Promise.all(deleteTasks);
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
            const basePath = path.join(__dirname, '../../public');
            // Tạo mảng các tác vụ xoá ảnh
            const deleteTasks = [];
            // Xóa ảnh của các bệnh viện
            hospitals.forEach(async (hospital) => {
                // Xoá ảnh đại diện
                if (hospital.thumbnail) {
                    const thumbnailPath = path.join(basePath, hospital.thumbnail);
                    deleteTasks.push(deleteFile(thumbnailPath));
                }
                // Xoá các ảnh khác
                if (Array.isArray(hospital.images) && hospital.images.length > 0) {
                    hospital.images.forEach(image => {
                        const imagePath = path.join(basePath, image);
                        deleteTasks.push(deleteFile(imagePath));
                    });
                }
                await Promise.all(deleteTasks);
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
            query.type = 'clinic'; // Chỉ tìm kiếm phòng khám
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
    getAllDoctorsHospital = async (hospitalId) => {
        try {
            const hospital = await Hospital.findById(hospitalId)
                .populate({
                    path: 'doctors',
                    populate: [
                        {
                            path: 'user',
                            select: 'name email phone address image'
                        
                        },
                        {
                            path: 'specialties',
                            select: 'name description image'
                        }
                    ]
                })

            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                };
            }

            if (!hospital.doctors || hospital.doctors.length === 0) {
                return {
                    status: 'success',
                    message: 'Bệnh viện chưa có bác sĩ nào',
                    data: []
                };
            }
            return {
                status: 'success',
                message: 'Lấy danh sách bác sĩ của bệnh viện thành công',
                data: hospital.doctors
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