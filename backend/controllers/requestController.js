import { PrismaClient } from '@prisma/client';
import { generateServiceRequestId } from '../utils/codeGenerator.js';

const prisma = new PrismaClient();

/**
 * Create a new service request
 * POST /api/requests
 */
export const createRequest = async (req, res) => {
    try {
        const { serviceId, description, location, preferredDate } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!serviceId) {
            return res.status(400).json({ error: 'Service ID is required' });
        }

        // Check if service exists
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Generate unique request code
        const requestCode = generateServiceRequestId();

        // Create service request
        const serviceRequest = await prisma.serviceRequest.create({
            data: {
                requestCode,
                userId,
                serviceId,
                description: description || null,
                location: location || null,
                preferredDate: preferredDate ? new Date(preferredDate) : null,
                status: 'REQUESTED',
            },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        // Notify admin
        console.log(`[NOTIFICATION] New service request created: ${requestCode} by ${req.user.name}`);

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            request: serviceRequest,
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create service request', details: error.message });
    }
};

/**
 * List service requests
 * GET /api/requests
 * - USER role: only their requests
 * - ADMIN role: all requests
 */
export const listRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const whereClause = userRole === 'ADMIN' ? {} : { userId };

        const requests = await prisma.serviceRequest.findMany({
            where: whereClause,
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                quotations: {
                    select: {
                        id: true,
                        quotationNumber: true,
                        totalAmount: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    } catch (error) {
        console.error('List requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
    }
};

/**
 * Get single request by ID
 * GET /api/requests/:id
 */
export const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                    },
                },
                quotations: {
                    include: {
                        milestones: true,
                    },
                },
                payments: true,
                progressLogs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!request) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Check ownership (USER can only view their own requests)
        if (userRole === 'USER' && request.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({
            success: true,
            request,
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Failed to fetch request', details: error.message });
    }
};

/**
 * Update service request (description, location, preferredDate)
 * PUT /api/requests/:id
 * Only USER can edit their own requests, only when status is REQUESTED
 */
export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, location, preferredDate } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find existing request
        const existingRequest = await prisma.serviceRequest.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Check ownership
        if (userRole === 'USER' && existingRequest.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only allow editing when status is REQUESTED
        if (existingRequest.status !== 'REQUESTED') {
            return res.status(400).json({
                error: 'Cannot edit request after it has been quoted',
                currentStatus: existingRequest.status,
            });
        }

        // Update request
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: {
                description: description !== undefined ? description : existingRequest.description,
                location: location !== undefined ? location : existingRequest.location,
                preferredDate: preferredDate ? new Date(preferredDate) : existingRequest.preferredDate,
                updatedAt: new Date(),
            },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Notify admin about the edit
        console.log(`[NOTIFICATION] Request ${existingRequest.requestCode} was edited by ${existingRequest.user.name}`);

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            request: updatedRequest,
            edited: true, // Flag to show edited indicator
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Failed to update request', details: error.message });
    }
};

/**
 * Update request status (Admin only)
 * PUT /api/requests/:id/status
 * Validates workflow transition
 */
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user.role;

        // Only ADMIN can update status
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can update request status' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Validate status value
        const validStatuses = ['REQUESTED', 'QUOTED', 'APPROVED', 'PAYMENT', 'IN_PROGRESS', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Find existing request
        const existingRequest = await prisma.serviceRequest.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Validate workflow transition
        const workflowSequence = ['REQUESTED', 'QUOTED', 'APPROVED', 'PAYMENT', 'IN_PROGRESS', 'COMPLETED'];
        const currentIndex = workflowSequence.indexOf(existingRequest.status);
        const nextIndex = workflowSequence.indexOf(status);

        // Allow only sequential progression
        if (nextIndex !== currentIndex + 1) {
            return res.status(400).json({
                error: `Cannot transition from ${existingRequest.status} to ${status}`,
                currentStatus: existingRequest.status,
                allowedNextStatus: workflowSequence[currentIndex + 1] || 'COMPLETED (final)',
            });
        }

        // Update status
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date(),
            },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Notify user about status change
        console.log(`[NOTIFICATION] Request ${existingRequest.requestCode} status changed to ${status} - notify user: ${existingRequest.user.email}`);

        res.status(200).json({
            success: true,
            message: `Status updated to ${status}`,
            request: updatedRequest,
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status', details: error.message });
    }
};

export default {
    createRequest,
    listRequests,
    getRequestById,
    updateRequest,
    updateRequestStatus,
};
