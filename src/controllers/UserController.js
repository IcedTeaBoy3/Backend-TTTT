
const UserService = require('../services/UserService');

class UserController {
    getAllUsers = async (req, res) => {
        try {
            const data = await UserService.getAllUsers();
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    getUser = async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID người dùng'
                });
            }
            const data = await UserService.getUser(userId);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    updateUser = async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, email, phone, dateOfBirth, gender, address, ethnic, idCard, insuranceCode, job } = req.body;
            
            const emailRegex = /\S+@\S+\.\S+/;
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
            const validEmail = emailRegex.test(email);
            const validPhone = phoneRegex.test(phone);
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID người dùng'
                });
            }
            if (!name || !email || !phone || !address) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            } else if (!validEmail) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email không hợp lệ'
                });
            } else if (!validPhone) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Số điện thoại không hợp lệ'
                });
            }
            const data = await UserService.updateUser(userId, req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    deleteUser = async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID người dùng'
                });
            }
            const data = await UserService.deleteUser(userId);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    deleteManyUsers = async (req, res) => {
        try {
            const userIds = req.body.ids;
            if (!userIds || userIds.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID người dùng'
                });
            }
            const data = await UserService.deleteManyUsers(userIds);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    insertManyUsers = async (req, res) => {
        try {
            const users = req.body;
            if (!users || users.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp danh sách người dùng'
                });
            }
            const data = await UserService.insertManyUsers(users);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
    uploadAvatar = async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng cung cấp ID người dùng'
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng tải lên tệp ảnh'
                });
            }
            const data = await UserService.uploadAvatar(userId, req.file);
            res.json(data);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}
module.exports = new UserController();