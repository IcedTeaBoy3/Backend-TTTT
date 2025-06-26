const Hospital = require('../models/Hospital');
const {deleteImage} = require('../utils/imageUtils');
const path = require('path');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
class HospitalService {
    createHospital = async (data) => {
        try {
            const { name, address, phone, description, thumbnail, images, doctors, type } = data;
            let dataCreate = {
                name,
                address,
                phone,
                description,
                thumbnail,
                images,
                type: type,
                doctors,
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
                .populate({
                    path: 'doctors',
                    populate: 
                    [
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
            const { pageNumber, limitNumber, type, status, searchValue, specialty } = data;
            const page = parseInt(pageNumber) || 1;
            const limit = parseInt(limitNumber) || 10;
            const skip = (page - 1) * limit;

            let pipeline = [];

            // Join với bảng Doctor
            pipeline.push({
                $lookup: {
                    from: 'doctors',
                    localField: 'doctors',
                    foreignField: '_id',
                    as: 'doctorDetails'
                }
            });

            // Tách riêng filter
            const matchStage = [];

            if (type) matchStage.push({ type });
            if (status && ['active', 'inactive'].includes(status)) {
                matchStage.push({ status });
            }

            if (searchValue) {
                matchStage.push({
                    $or: [
                        { name: { $regex: searchValue, $options: 'i' } },
                        { address: { $regex: searchValue, $options: 'i' } },
                        { phone: { $regex: searchValue, $options: 'i' } },
                        { description: { $regex: searchValue, $options: 'i' } }
                    ]
                });
            }

            if (specialty) {
                matchStage.push({
                    doctorDetails: {
                        $elemMatch: {
                            specialties: new ObjectId(specialty)
                        }
                    }
                });
            }

            if (matchStage.length > 0) {
                pipeline.push({ $match: { $and: matchStage } });
            }

            // Đếm tổng
            const countPipeline = [...pipeline, { $count: 'total' }];
            const countResult = await Hospital.aggregate(countPipeline);
            const total = countResult[0]?.total || 0;

            // Phân trang
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: limit });
            pipeline.push({
                $project: {
                    doctorDetails: 0 // ẩn đi
                }
            });
            // Lấy dữ liệu
            const hospitals = await Hospital.aggregate(pipeline);
           // Lấy lại danh sách hospital đã lọc theo id để populate đúng
            const hospitalIds = hospitals.map(h => h._id);

            const populatedHospitals = await Hospital.find({ _id: { $in: hospitalIds } })
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

            return {
                status: 'success',
                message: 'Lấy danh sách bệnh viện thành công',
                data: populatedHospitals,
                total
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    };


    updateHospital = async (id, data) => {
        try {
            const {
                name,
                address,
                phone,
                description,
                doctors,
                type,
                thumbnail,
                isImageDeleted, // thumbnail bị xoá
                images = [],     // ảnh mới upload
                oldImages = [],  // ảnh cũ giữ lại
                status 
            } = data;

            const hospital = await Hospital.findById(id);
            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại',
                };
            }

            const basePath = path.join(__dirname, '../../public');
            const deleteTasks = [];

            // --- Xử lý thumbnail ---
            if (isImageDeleted || (thumbnail && thumbnail !== hospital.thumbnail)) {
                if (hospital.thumbnail) {
                    const thumbnailPath = path.join(basePath, hospital.thumbnail);
                    deleteTasks.push(deleteImage(thumbnailPath));
                }
            }

            // --- Xử lý ảnh chi tiết ---
            const newImageList = [...oldImages]; // khởi đầu là ảnh cũ giữ lại
            if (Array.isArray(images) && images.length > 0) {
                newImageList.push(...images); // thêm ảnh mới vào danh sách
            }

            if (Array.isArray(hospital.images)) {
                const removedImages = hospital.images.filter(
                    (oldImg) => !oldImages.includes(oldImg)
                );
                removedImages.forEach((img) => {
                    const imgPath = path.join(basePath, img);
                    deleteTasks.push(deleteImage(imgPath));
                });
            }

            const updateData = {
                name,
                address,
                phone,
                description,
                doctors,
                type,
                images: newImageList,
                status
            };

            if (thumbnail && !isImageDeleted) {
                updateData.thumbnail = thumbnail;
            } else if (isImageDeleted) {
                updateData.thumbnail = null;
            }

            // Thực hiện xóa các ảnh không cần nữa
            await Promise.all(deleteTasks);

            // Cập nhật thông tin bệnh viện
            const updatedHospital = await Hospital.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            return {
                status: 'success',
                message: 'Cập nhật bệnh viện thành công',
                data: updatedHospital,
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    };
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
                deleteTasks.push(deleteImage(thumbnailPath));
            }
            // Xoá các ảnh khác
            if(Array.isArray(hospital.images) && hospital.images.length > 0) {
                hospital.images.forEach(image => {
                    const imagePath = path.join(basePath, image);
                    deleteTasks.push(deleteImage(imagePath));
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
                    deleteTasks.push(deleteImage(thumbnailPath));
                }
                // Xoá các ảnh khác
                if (Array.isArray(hospital.images) && hospital.images.length > 0) {
                    hospital.images.forEach(image => {
                        const imagePath = path.join(basePath, image);
                        deleteTasks.push(deleteImage(imagePath));
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
        let { keyword = '', specialty = '', pageNumber = 1, limitNumber = 10 } = data;
        const skip = (pageNumber - 1) * limitNumber;

        // Kiểm tra và chuyển specialty thành ObjectId nếu hợp lệ
        if (specialty) {
            try {
                specialty = new mongoose.Types.ObjectId(specialty);
            } catch (err) {
                return {
                status: 'error',
                message: 'ID chuyên khoa không hợp lệ'
                };
            }
        }

        const matchStage = {
            type: 'hospital'
        };

        if (keyword) {
            matchStage.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { address: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        const pipeline = [
            { $match: matchStage },

            // Lấy thông tin bác sĩ
            {
                $lookup: {
                from: 'doctors',
                localField: 'doctors',
                foreignField: '_id',
                as: 'doctorDetails'
                }
            },

            // Tách mảng doctorDetails để dễ match specialty
            { $unwind: '$doctorDetails' },

            // Nếu có lọc chuyên khoa
            specialty
                ? {
                    $match: {
                    'doctorDetails.specialties': specialty
                    }
                }
                : null,

            // Lấy thông tin user (bác sĩ)
            {
                $lookup: {
                from: 'users',
                localField: 'doctorDetails.user',
                foreignField: '_id',
                as: 'doctorUser'
                }
            },
            { $unwind: '$doctorUser' },

            // Lấy thông tin chuyên khoa (nếu cần dùng để tìm theo keyword)
            {
                $lookup: {
                from: 'specialties',
                localField: 'doctorDetails.specialties',
                foreignField: '_id',
                as: 'specialtyDetails'
                }
            },

        // Nếu có keyword để tìm theo tên chuyên khoa
            keyword
                ? {
                    $match: {
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { address: { $regex: keyword, $options: 'i' } },
                        { phone: { $regex: keyword, $options: 'i' } },
                        { description: { $regex: keyword, $options: 'i' } },
                        { 'specialtyDetails.name': { $regex: keyword, $options: 'i' } }
                    ]
                    }
                }
                : null,

            // Gom lại theo bệnh viện sau khi unwind
            {
                $group: {
                _id: '$_id',
                name: { $first: '$name' },
                address: { $first: '$address' },
                phone: { $first: '$phone' },
                description: { $first: '$description' },
                thumbnail: { $first: '$thumbnail' },
                images: { $first: '$images' },
                type: { $first: '$type' },
                doctors: { $push: '$doctorDetails' }
                }
            },

            { $skip: skip },
            { $limit: parseInt(limitNumber) }
            ].filter(Boolean); // Bỏ null

        const hospitals = await Hospital.aggregate(pipeline);

        // Đếm tổng kết quả
        const totalPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                from: 'doctors',
                localField: 'doctors',
                foreignField: '_id',
                as: 'doctorDetails'
                }
            },
            { $unwind: '$doctorDetails' },
        specialty
            ? {
                $match: {
                'doctorDetails.specialties': specialty
                }
            }
            : null,
            {
                $lookup: {
                from: 'specialties',
                localField: 'doctorDetails.specialties',
                foreignField: '_id',
                as: 'specialtyDetails'
                }
            },
        keyword
            ? {
                $match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { address: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                    { 'specialtyDetails.name': { $regex: keyword, $options: 'i' } }
                ]
                }
            }
            : null,
            {
                $group: {
                _id: '$_id'
                }
            },
            {
                $count: 'count'
            }
        ].filter(Boolean);

        const totalResult = await Hospital.aggregate(totalPipeline);

        return {
            status: 'success',
            message: 'Tìm kiếm bệnh viện thành công',
            data: hospitals,
            total: totalResult[0]?.count || 0
        };
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
    };
    getAllDoctorsHospital = async (data) => {
        try {
            const { hospitalId } = data;
            const hospital = await Hospital.findById(hospitalId)
                .populate({
                    path: 'doctors',
                    populate: 
                        [    
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