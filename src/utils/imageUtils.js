const fs = require('fs/promises');
const path = require('path');
const deleteImage = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log('Deleted file:', filePath);
    } catch (err) {
        console.error('Failed to delete file:', filePath, '-', err.message);
        throw err; 
    }
};

const moveImageToBackup = async (filePath) => {
    try {
        // Loại bỏ dấu / ở đầu nếu có, để path.join không bị lỗi
        const normalizedPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

        const currentPath = path.join(__dirname, "../../public", normalizedPath);
        const backupPath = path.join(__dirname, "../../public/backup_uploads", path.basename(filePath));

        try {
            await fs.access(currentPath); // kiểm tra tồn tại
            await fs.rename(currentPath, backupPath);
            console.log(`✅ Đã chuyển ảnh sang backup: ${backupPath}`);
        } catch {
            console.warn("⚠️ Ảnh không tồn tại:", currentPath);
        }
    } catch (err) {
        console.error('❌ Failed to move file to backup:', err.message);
        throw err;
    }
};
const restoreImageFromBackup = async (filePath) => {
    try {
        // Normalize lại đường dẫn nếu bắt đầu bằng /
        const normalizedPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

        const fileName = path.basename(normalizedPath);
        const backupPath = path.join(__dirname, "../../public/backup_uploads", fileName);
        const restorePath = path.join(__dirname, "../../public/uploads", fileName);

        try {
            await fs.access(backupPath); // kiểm tra tồn tại
            await fs.rename(backupPath, restorePath);
            console.log(`✅ Đã phục hồi ảnh từ backup: ${restorePath}`);
            return true;
        } catch (err) {
            console.warn("⚠️ Ảnh không tồn tại trong backup:", backupPath);
            return false;
        }
        
    } catch (err) {
        console.error("❌ Lỗi khi phục hồi ảnh:", err.message);
        return false;
    }
};


module.exports = {
    deleteImage,
    moveImageToBackup,
    restoreImageFromBackup
};