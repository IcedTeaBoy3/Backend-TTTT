const fs = require('fs/promises');

const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log('Deleted file:', filePath);
    } catch (err) {
        console.error('Failed to delete file:', filePath, '-', err.message);
        throw err; // Thêm dòng này để Promise.all biết có lỗi
    }
};

module.exports = {
    deleteFile
};