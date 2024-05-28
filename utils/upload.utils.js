const fs = require('fs');
const multer = require('multer');
const path = require('path');
const {randomBytes} = require('crypto');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = './public/sheets';
        fs.mkdir(destinationPath, {recursive: true}, (err) => {
            if (err) {
                throw new Error(err.message);
            }
            cb(null, destinationPath);
        });
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        cb(null, `${randomBytes(10).toString("hex")}${fileExtension}`);
    },
});
const isValidExcelFile = (file) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    return allowedExtensions.includes(fileExtension);
};
const multerConfig = {
    storage: storage,
    limits: {fileSize: 15000000},
    fileFilter: (req, file, cb) => {
        if (!isValidExcelFile(file)) {
            return cb(new Error('Invalid file type. Only Excel files are allowed.'));
        }
        cb(null, true);
    },
};
module.exports = multer(multerConfig);
