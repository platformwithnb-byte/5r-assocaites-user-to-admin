import express from 'express';
import {
    createQuotation,
    getQuotationById,
    getQuotationsByRequestId,
    approveQuotation,
    rejectQuotation,
    deleteQuotation,
} from '../controllers/quotationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new quotation (admin only)
router.post('/', createQuotation);

// Get quotations by request ID (MUST come BEFORE /:id route)
router.get('/request/:requestId', getQuotationsByRequestId);

// Get quotation by ID
router.get('/:id', getQuotationById);

// Approve quotation (user)
router.put('/:id/approve', approveQuotation);

// Reject quotation (user)
router.put('/:id/reject', rejectQuotation);

// Delete quotation (admin only)
router.delete('/:id', deleteQuotation);

export default router;
