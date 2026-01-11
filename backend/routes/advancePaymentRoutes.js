import express from 'express';
import {
    requestAdvancePayment,
    getAdvancePaymentsByRequest,
    approveAdvancePayment,
    markAdvancePaid,
    listAdvancePayments,
} from '../controllers/advancePaymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Request advance payment (admin)
router.post('/', requestAdvancePayment);

// Get advances for a request
router.get('/request/:requestId', getAdvancePaymentsByRequest);

// Approve advance (admin)
router.put('/:advanceId/approve', approveAdvancePayment);

// Mark as paid (admin)
router.put('/:advanceId/paid', markAdvancePaid);

// List all advances (admin)
router.get('/', listAdvancePayments);

export default router;
