const User = require('../models/User');
const Doctor = require('../models/Doctor');
class DoctorService {
    addDoctor = async (data) => {
        try {
            const { name, email, password, phone, address, specialtyId, hospitalId } = data;
            const user = new User({
                name,
                email,
                password,
                phone,
                address,
                role: 'doctor'
            });
            await user.save();
            const doctor = new Doctor({
                user: user._id,
                specialty: specialtyId,
                hospital: hospitalId
            });
            await doctor.save();
            return {
                status: 'success',
                message: 'Thêm bác sĩ thành công'
            };
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new DoctorService();