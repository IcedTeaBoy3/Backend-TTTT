const Hospital = require('../models/Hospital');

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
    getAllHospitals = async () => {
        try {
            const hospitals = await Hospital.find();
            return {
                status: 'success',
                message: 'Lấy danh sách bệnh viện thành công',
                data: hospitals
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
            const hospital = await Hospital.findByIdAndUpdate(id, {
                name,
                address,
                phone,
                description,
                image
            }, { new: true });
            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            return {
                status: 'success',
                message: 'Cập nhật bệnh viện thành công',
                data: hospital
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
            const hospital = await Hospital.findByIdAndDelete(id);
            if (!hospital) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
            return {
                status: 'success',
                message: "Xóa bệnh viện thành công",
                data: hospital
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
            const hospitals = await Hospital.deleteMany({ _id: { $in: ids } });
            if (!hospitals) {
                return {
                    status: 'error',
                    message: 'Bệnh viện không tồn tại'
                }
            }
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