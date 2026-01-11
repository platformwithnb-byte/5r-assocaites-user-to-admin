import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Request Advance Payment for a Progress Update
 * POST /api/advance-payments
 * Body: { requestId, progressId, stage, advanceAmount, description }
 */
export const requestAdvancePayment = async (req, res) => {
    try {
        const { requestId, progressId, stage, advanceAmount, description } = req.body;
        const adminId = req.user.id;
        const userRole = req.user.role;

        // Only ADMIN can request advance payments
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can request advance payments' });
        }

        // Validate required fields
        if (!requestId || !stage || !advanceAmount) {
            return res.status(400).json({ error: 'requestId, stage, and advanceAmount are required' });
        }

        // Verify request exists
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { user: true, service: true, quotations: { where: { status: 'APPROVED' } } },
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Create advance payment request
        const advancePayment = await prisma.advancePayment.create({
            data: {
                requestId,
                progressId,
                quotationId: serviceRequest.quotations[0]?.id,
                stage,
                advanceAmount: parseFloat(advanceAmount),
                description: description || `Advance payment for ${stage}`,
                requestedBy: adminId,
                status: 'PENDING',
            },
            include: {
                request: { include: { service: true, user: true } },
            },
        });

        // Update request payment status
        await prisma.serviceRequest.update({
            where: { id: requestId },
            data: { paymentStatus: 'ADVANCE_REQUESTED' },
        });

        console.log(`[ADVANCE] Advance payment requested for ${serviceRequest.requestCode} - Stage: ${stage}, Amount: ₹${advanceAmount}`);
        console.log(`[NOTIFICATION] User ${serviceRequest.user.email} has new advance payment request`);

        res.status(201).json({
            success: true,
            message: 'Advance payment requested successfully',
            data: advancePayment,
        });
    } catch (error) {
        console.error('Request advance payment error:', error);
        res.status(500).json({ error: 'Failed to request advance payment', details: error.message });
    }
};

/**
 * Get Advance Payments for a Request
 * GET /api/advance-payments/request/:requestId
 */
export const getAdvancePaymentsByRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const advancePayments = await prisma.advancePayment.findMany({
            where: { requestId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: advancePayments.length,
            data: advancePayments,
        });
    } catch (error) {
        console.error('Get advance payments error:', error);
        res.status(500).json({ error: 'Failed to fetch advance payments', details: error.message });
    }
};

/**
 * Approve Advance Payment (Admin)
 * PUT /api/advance-payments/:advanceId/approve
 */
export const approveAdvancePayment = async (req, res) => {
    try {
        const { advanceId } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can approve advance payments' });
        }

        const advancePayment = await prisma.advancePayment.findUnique({
            where: { id: advanceId },
            include: { request: true },
        });

        if (!advancePayment) {
            return res.status(404).json({ error: 'Advance payment not found' });
        }

        const updated = await prisma.advancePayment.update({
            where: { id: advanceId },
            data: { status: 'APPROVED' },
            include: { request: true },
        });

        console.log(`[ADVANCE] Advance payment approved for ${advancePayment.request.requestCode}`);

        res.status(200).json({
            success: true,
            message: 'Advance payment approved',
            data: updated,
        });
    } catch (error) {
        console.error('Approve advance payment error:', error);
        res.status(500).json({ error: 'Failed to approve advance payment', details: error.message });
    }
};

/**
 * Mark Advance as Paid (after payment received)
 * PUT /api/advance-payments/:advanceId/paid
 */
export const markAdvancePaid = async (req, res) => {
    try {
        const { advanceId } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can mark advance as paid' });
        }

        const advancePayment = await prisma.advancePayment.findUnique({
            where: { id: advanceId },
            include: { request: true },
        });

        if (!advancePayment) {
            return res.status(404).json({ error: 'Advance payment not found' });
        }

        const updated = await prisma.advancePayment.update({
            where: { id: advanceId },
            data: { status: 'PAID' },
            include: { request: true },
        });

        // Update request payment status to ADVANCE_PAID if all advances are paid
        const pendingAdvances = await prisma.advancePayment.findMany({
            where: {
                requestId: advancePayment.requestId,
                status: { in: ['PENDING', 'APPROVED'] },
            },
        });

        if (pendingAdvances.length === 0) {
            await prisma.serviceRequest.update({
                where: { id: advancePayment.requestId },
                data: { paymentStatus: 'ADVANCE_PAID' },
            });
        }

        console.log(`[ADVANCE] Advance payment marked as paid for ${advancePayment.request.requestCode}`);
        console.log(`[NOTIFICATION] User ${advancePayment.request.userId} - Advance payment received`);

        res.status(200).json({
            success: true,
            message: 'Advance payment marked as paid',
            data: updated,
        });
    } catch (error) {
        console.error('Mark advance paid error:', error);
        res.status(500).json({ error: 'Failed to mark advance as paid', details: error.message });
    }
};

/**
 * Get all Advance Payments (Admin)
 * GET /api/advance-payments
 */
export const listAdvancePayments = async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can list all advance payments' });
        }

        const advancePayments = await prisma.advancePayment.findMany({
            include: { request: { include: { service: true, user: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: advancePayments.length,
            data: advancePayments,
        });
    } catch (error) {
        console.error('List advance payments error:', error);
        res.status(500).json({ error: 'Failed to list advance payments', details: error.message });
    }
};
