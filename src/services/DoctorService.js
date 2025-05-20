const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
class DoctorService {
    createDoctor = async (data) => {
        try {
            const { name, email, password, phone, address, specialtyId, hospitalId, position, qualification ,experience , description} = data;
            const hashPassword = await bcrypt.hash(password, 10);
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return {
                    status: 'error',
                    message: 'Email đã tồn tại'
                };
            }
            const user = await User.create({
                name,
                email,
                password: hashPassword,
                phone,
                address,
                role: 'doctor'
            });
            if (!user) {
                return {
                    status: 'error',
                    message: 'Tạo tài khoản bác sĩ thất bại'
                };
            }
            const doctor = await Doctor.create({
                user: user._id,
                specialty: specialtyId,
                hospital: hospitalId,
                position,
                qualification,
                experience,
                description
            });
            return {
                status: 'success',
                message: 'Thêm bác sĩ thành công',
                data: doctor
            };
        } catch (error) {
            throw error;
        }
    }
    updateDoctor = async (id, data) => {
        try {
            const {
                name,
                email,
                phone,
                address,
                specialtyId,
                hospitalId,
                position,
                qualification,
                experience,
                description
            } = data;

            // Lấy doctor trước
            const doctor = await Doctor.findById(id).populate("user");
            if (!doctor) {
                return {
                    status: "error",
                    message: "Không tìm thấy bác sĩ"
                };
            }

            const user = await User.findById(doctor.user);
            if (!user) {
                return {
                    status: "error",
                    message: "Không tìm thấy tài khoản người dùng"
                };
            }

            // Kiểm tra nếu email mới khác và bị trùng
            if (email && email !== user.email) {
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return {
                        status: "error",
                        message: "Email đã tồn tại"
                    };
                }
            }

            // Cập nhật user
            user.name = name;
            user.email = email;
            user.phone = phone;
            user.address = address;
            await user.save();

            // Cập nhật doctor
            doctor.specialty = specialtyId;
            doctor.hospital = hospitalId;
            doctor.position = position;
            doctor.qualification = qualification;
            doctor.experience = experience;
            doctor.description = description;

            await doctor.save();

            return {
                status: "success",
                message: "Cập nhật bác sĩ thành công",
                data: doctor
            };
        } catch (error) {
            console.error(error);
            return {
                status: "error",
                message: "Đã xảy ra lỗi khi cập nhật bác sĩ"
            };
        }
    };
    deleteDoctor = async (id) => {
        try {
            const doctor = await Doctor.findByIdAndDelete(id);
            if (!doctor) {
                return {
                    status: 'error',
                    message: 'Xóa bác sĩ thất bại'
                };
            }
            await User.findByIdAndDelete(doctor.user);
            return {
                status: 'success',
                message: 'Xóa bác sĩ thành công'
            };
        } catch (error) {
            throw error;
        }
    }
    getAllDoctors = async (data) => {
        try {
            const { page, limit } = data;
            const skip = (page - 1) * limit;
            const doctors = await Doctor.find()
                .populate('user', 'name email phone address')
                .populate('specialty', 'name')
                .populate('hospital', 'name')
                .skip(skip)
                .limit(limit);
            const total = await Doctor.countDocuments();
            return {
                status: 'success',
                message: 'Lấy danh sách bác sĩ thành công',
                data: doctors,
                total
            };
        } catch (error) {
            throw error;
        }
    }
    getDoctor = async (id) => {
        try {
            const doctor = await Doctor.findById(id)
                .populate('user', 'name email phone address')
                .populate('specialty', 'name')
                .populate('hospital', 'name');
            if (!doctor) {
                return {
                    status: 'error',
                    message: 'Không tìm thấy bác sĩ'
                };
            }
            return {
                status: 'success',
                message: 'Lấy thông tin bác sĩ thành công',
                data: doctor
            };
        } catch (error) {
            throw error;
        }
    }
    deleteManyDoctors = async (ids) => {
        try {
            const doctors = await Doctor.deleteMany({ _id: { $in: ids } });
            if (!doctors) {
                return {
                    status: 'error',
                    message: 'Xóa bác sĩ thất bại'
                };
            }
            await User.deleteMany({ _id: { $in: ids } });
            return {
                status: 'success',
                message: 'Xóa bác sĩ thành công'
            };
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new DoctorService();