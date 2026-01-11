import { PrismaClient } from '@prisma/client';
import { generateQuotationNumber } from '../utils/codeGenerator.js';
import { config } from '../config/config.js';

const prisma = new PrismaClient();

/**
 * Create a new quotation
 * POST /api/quotations
 */
export const createQuotation = async (req, res) => {
    try {
        const { requestId, baseAmount, description, validUntil } = req.body; // requestId is string (cuid)
        const userRole = req.user.role;

        // Only ADMIN can create quotations
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can create quotations' });
        }

        // Validate required fields
        if (!requestId || baseAmount === undefined) {
            return res.status(400).json({ error: 'requestId and baseAmount are required' });
        }

        // Check if request exists and get user
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { user: true, service: true },
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Calculate amounts
        const serviceTax = 0; // Default to 0
        const gstRate = config.gstRate || 18;
        const gstAmount = baseAmount * (gstRate / 100);
        const totalAmount = baseAmount + serviceTax + gstAmount;

        // Generate quotation number
        const quotationNumber = generateQuotationNumber(requestId);

        // Create quotation
        const quotation = await prisma.quotation.create({
            data: {
                quotationNumber,
                requestId,
                userId: serviceRequest.user.id,
                baseAmount,
                serviceTax,
                gstRate,
                gstAmount,
                totalAmount,
                description: description || null,
                validUntil: validUntil ? new Date(validUntil) : null,
                status: 'PENDING',
            },
            include: {
                request: { include: { service: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });

        // Update request status to QUOTED
        await prisma.serviceRequest.update({
            where: { id: requestId },
            data: { status: 'QUOTED' },
        });

        // Notify user
        console.log(`[NOTIFICATION] Quotation ${quotationNumber} created for request ${serviceRequest.requestCode} - notify user: ${serviceRequest.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            quotation,
        });
    } catch (error) {
        console.error('Create quotation error:', error);
        res.status(500).json({ error: 'Failed to create quotation', details: error.message });
    }
};

/**
 * Get quotation by ID
 * GET /api/quotations/:id
 */
export const getQuotationById = async (req, res) => {
    try {
        const { id } = req.params;
        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: {
                request: { include: { service: true } },
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
        });

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        res.status(200).json({
            success: true,
            quotation,
        });
    } catch (error) {
        console.error('Get quotation error:', error);
        res.status(500).json({ error: 'Failed to fetch quotation', details: error.message });
    }
};

/**
 * Get quotations by request ID
 * GET /api/quotations/request/:requestId
 */
export const getQuotationsByRequestId = async (req, res) => {
    try {
        const { requestId } = req.params;
        if (!requestId) {
            return res.status(400).json({ error: 'Valid requestId is required' });
        }

        const quotations = await prisma.quotation.findMany({
            where: { requestId },
            include: {
                request: { include: { service: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: quotations.length,
            quotations,
        });
    } catch (error) {
        console.error('Get quotations error:', error);
        res.status(500).json({ error: 'Failed to fetch quotations', details: error.message });
    }
};

/**
 * Approve quotation (user action)
 * PUT /api/quotations/:id/approve
 */
export const approveQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: { request: true, user: true },
        });

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        // Check ownership (user owns the quotation)
        if (quotation.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if already approved/rejected
        if (quotation.status !== 'PENDING') {
            return res.status(400).json({
                error: `Cannot approve a ${quotation.status} quotation`,
                currentStatus: quotation.status,
            });
        }

        // Update quotation status
        const updated = await prisma.quotation.update({
            where: { id },
            data: { status: 'APPROVED' },
            include: { request: true, user: true },
        });

        // Update request status to APPROVED
        await prisma.serviceRequest.update({
            where: { id: quotation.requestId },
            data: { status: 'APPROVED' },
        });

        console.log(`[NOTIFICATION] Quotation ${quotation.quotationNumber} approved by ${quotation.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Quotation approved',
            quotation: updated,
        });
    } catch (error) {
        console.error('Approve quotation error:', error);
        res.status(500).json({ error: 'Failed to approve quotation', details: error.message });
    }
};

/**
 * Reject quotation (user action)
 * PUT /api/quotations/:id/reject
 */
export const rejectQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: { request: true, user: true },
        });

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        // Check ownership
        if (quotation.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if can be rejected
        if (quotation.status !== 'PENDING') {
            return res.status(400).json({
                error: `Cannot reject a ${quotation.status} quotation`,
                currentStatus: quotation.status,
            });
        }

        // Update quotation status
        const updated = await prisma.quotation.update({
            where: { id },
            data: { status: 'REJECTED' },
            include: { request: true, user: true },
        });

        // Reset request status back to REQUESTED
        await prisma.serviceRequest.update({
            where: { id: quotation.requestId },
            data: { status: 'REQUESTED' },
        });

        console.log(`[NOTIFICATION] Quotation ${quotation.quotationNumber} rejected by ${quotation.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Quotation rejected',
            quotation: updated,
        });
    } catch (error) {
        console.error('Reject quotation error:', error);
        res.status(500).json({ error: 'Failed to reject quotation', details: error.message });
    }
};

/**
 * Delete quotation (admin only, only if PENDING)
 * DELETE /api/quotations/:id
 */
export const deleteQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        // Only ADMIN can delete
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can delete quotations' });
        }

        const quotation = await prisma.quotation.findUnique({
            where: { id },
        });

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        // Only delete if PENDING
        if (quotation.status !== 'PENDING') {
            return res.status(400).json({
                error: `Cannot delete a ${quotation.status} quotation`,
                currentStatus: quotation.status,
            });
        }

        // Reset request back to REQUESTED
        await prisma.serviceRequest.update({
            where: { id: quotation.requestId },
            data: { status: 'REQUESTED' },
        });

        // Delete quotation
        await prisma.quotation.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Quotation deleted',
        });
    } catch (error) {
        console.error('Delete quotation error:', error);
        res.status(500).json({ error: 'Failed to delete quotation', details: error.message });
    }
};

export default {
    createQuotation,
    getQuotationById,
    getQuotationsByRequestId,
    approveQuotation,
    rejectQuotation,
    deleteQuotation,
};
