import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/config.js';

/**
 * Multer Configuration for File Uploads
 * Supports images and videos for work progress
 */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Organize uploads by service request ID
        const serviceRequestId = req.params.serviceRequestId || req.body.serviceRequestId || 'temp';
        const uploadDir = path.join(config.upload.uploadDir, serviceRequestId);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = config.upload.allowedFileTypes.map((type) => '.' + type);
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
        return cb(
            new Error(`Invalid file type. Allowed types: ${config.upload.allowedFileTypes.join(', ')}`)
        );
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
    },
});

/**
 * Error handling for multer
 */
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({ error: `File too large. Max size: ${config.upload.maxFileSize} bytes` });
        }
        return res.status(400).json({ error: error.message });
    }

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    next();
};

export default {
    upload,
    handleUploadError,
};
