import express from 'express';
import {
    createRequest,
    listRequests,
    getRequestById,
    updateRequest,
    updateRequestStatus,
} from '../controllers/requestController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new service request
router.post('/', createRequest);

// List all requests (filtered by role)
router.get('/', listRequests);

// Get single request by ID
router.get('/:id', getRequestById);

// Update request details (USER only, when status is REQUESTED)
router.put('/:id', updateRequest);

// Update request status (ADMIN only)
router.put('/:id/status', updateRequestStatus);

export default router;
