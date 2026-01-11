import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

const prisma = new PrismaClient();

/**
 * Initiate payment for an approved request
 * POST /api/payments/initiate
 * Body: { requestId, quotationId }
 */
export const initiatePayment = async (req, res) => {
    try {
        const { requestId, quotationId } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!requestId || !quotationId) {
            return res.status(400).json({ error: 'requestId and quotationId are required' });
        }

        // Get request and quotation
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { user: true, service: true },
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Verify ownership
        if (serviceRequest.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check request status is APPROVED
        if (serviceRequest.status !== 'APPROVED') {
            return res.status(400).json({
                error: 'Request must be in APPROVED status to proceed with payment',
                currentStatus: serviceRequest.status,
            });
        }

        // Get quotation
        const quotation = await prisma.quotation.findUnique({
            where: { id: quotationId },
        });

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        // Verify quotation matches request and is APPROVED
        if (quotation.requestId !== requestId || quotation.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Invalid quotation or quotation not approved' });
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                requestId,
                userId,
                amount: quotation.totalAmount,
                currency: 'INR',
                type: 'FULL', // FULL payment for approved quotation
                status: 'PENDING', // Use enum value PENDING instead of string INITIATED
                razorpayOrderId: null, // Will be set after Razorpay order creation
                description: `Payment for ${serviceRequest.service.name} - ${serviceRequest.requestCode}`,
            },
            include: {
                request: { include: { service: true, user: true } },
            },
        });

        // In real implementation, call Razorpay API to create order
        // For now, simulate order creation
        const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Update payment with Razorpay order ID
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: { razorpayOrderId },
            include: { request: { include: { service: true } } },
        });

        // Return Razorpay order details for frontend
        res.status(200).json({
            success: true,
            message: 'Payment initiated',
            payment: updatedPayment,
            razorpay: {
                orderId: razorpayOrderId,
                amount: quotation.totalAmount * 100, // Razorpay expects amount in paise
                currency: 'INR',
                customerEmail: serviceRequest.user.email,
                customerName: serviceRequest.user.name,
                customerPhone: serviceRequest.user.phone,
            },
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
    }
};

/**
 * Verify and complete payment
 * POST /api/payments/verify
 * Body: { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature }
 */
export const verifyPayment = async (req, res) => {
    try {
        const { paymentId, razorpayPaymentId, razorpayOrderId } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!paymentId || !razorpayPaymentId || !razorpayOrderId) {
            return res.status(400).json({ error: 'Payment verification data is required' });
        }

        // Get payment record
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { request: { include: { service: true, user: true } } },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Verify ownership
        if (payment.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Verify payment status is PENDING
        if (payment.status !== 'PENDING') {
            return res.status(400).json({
                error: 'Payment already processed',
                currentStatus: payment.status,
            });
        }

        // In real implementation, verify Razorpay signature
        // For now, mark as successful
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'CAPTURED', // Use CAPTURED for successful payment
                razorpayPaymentId,
                updatedAt: new Date(),
            },
            include: { request: true },
        });

        // Update request status to PAYMENT (next stage in workflow)
        await prisma.serviceRequest.update({
            where: { id: payment.requestId },
            data: { status: 'PAYMENT' },
        });

        console.log(`[NOTIFICATION] Payment ${razorpayPaymentId} verified for request ${payment.request.requestCode} - User: ${payment.request.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Payment verified and completed',
            payment: updatedPayment,
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment', details: error.message });
    }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { request: { include: { service: true } } },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Verify ownership
        if (payment.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ error: 'Failed to fetch payment', details: error.message });
    }
};

/**
 * Get payments by request ID
 * GET /api/payments/request/:requestId
 */
export const getPaymentsByRequestId = async (req, res) => {
    try {
        const { requestId } = req.params;

        const payments = await prisma.payment.findMany({
            where: { requestId },
            include: { request: { include: { service: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
    }
};

/**
 * Get all payments for user (role-based)
 * GET /api/payments
 */
export const listPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // ADMIN sees all, USER sees only their own
        const whereClause = userRole === 'ADMIN' ? {} : { userId };

        const payments = await prisma.payment.findMany({
            where: whereClause,
            include: {
                request: { include: { service: true, user: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        });
    } catch (error) {
        console.error('List payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
    }
};
