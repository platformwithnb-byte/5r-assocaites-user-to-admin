import express from 'express';
import {
    initiatePayment,
    verifyPayment,
    getPaymentById,
    getPaymentsByRequestId,
    listPayments,
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Initiate payment for an approved request
router.post('/initiate', initiatePayment);

// Verify/complete payment
router.post('/verify', verifyPayment);

// Get all payments (role-filtered)
router.get('/', listPayments);

// Get payments by request ID
router.get('/request/:requestId', getPaymentsByRequestId);

// Get payment by ID
router.get('/:id', getPaymentById);

export default router;
