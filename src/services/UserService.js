const User = require('../models/User');
const bcrypt = require('bcrypt');
class UserService {
    getAllUsers = async () => {
        try {
            const users = await User.find();
            return {
                status: 'success',
                message: 'Lấy danh sách người dùng thành công',
                data: users
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    getUser = async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return {
                    status: 'error',
                    message: 'Người dùng không tồn tại'
                };
            }
            return {
                status: 'success',
                message: 'Lấy thông tin người dùng thành công',
                data: user
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    updateUser = async (userId, userData) => {
        try {
            const user = await User.findByIdAndUpdate(userId, userData, { new: true });
            if (!user) {
                return {
                    status: 'error',
                    message: 'Người dùng không tồn tại'
                };
            }
            return {
                status: 'success',
                message: 'Cập nhật thông tin người dùng thành công',
                data: user
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    deleteUser = async (userId) => {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return {
                    status: 'error',
                    message: 'Người dùng không tồn tại'
                };
            }
            return {
                status: 'success',
                message: 'Xóa người dùng thành công',
                data: user
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    deleteManyUsers = async (userIds) => {
        try {
            const users = await User.deleteMany({ _id: { $in: userIds } });
            if (!users) {
                return {
                    status: 'error',
                    message: 'Người dùng không tồn tại'
                };
            }
            return {
                status: 'success',
                message: 'Xóa người dùng thành công',
                data: users
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
}

module.exports = new UserService();