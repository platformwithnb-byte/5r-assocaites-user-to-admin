import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    addProgress,
    getProgressByRequestId,
    listProgress,
    deleteProgress,
    markAsCompleted,
    getEligibleRequests,
} from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/progress';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png, gif) and videos (mp4, mov, avi) are allowed'));
        }
    }
});

// All routes require authentication
router.use(authenticateToken);

// TEMP/TEST MODE: Get eligible requests for progress upload
router.get('/eligible', getEligibleRequests);

// Add progress update (admin only, with file upload)
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), addProgress);

// Get all progress (admin only)
router.get('/', listProgress);

// Get progress by request ID
router.get('/request/:requestId', getProgressByRequestId);

// Mark request as completed (admin only)
router.put('/complete/:requestId', markAsCompleted);

// Delete progress update (admin only)
router.delete('/:id', deleteProgress);

export default router;
