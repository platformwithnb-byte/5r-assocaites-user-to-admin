import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * TEMP/TEST MODE - Work Progress Testing
 * ⚠️ TEMPORARY FLAG: Remove once Razorpay API is integrated
 * 
 * When TEST_MODE = true:
 * - Requests in PAYMENT status can upload progress
 * - Real payment verification is BYPASSED for testing
 * - Status automatically transitions PAYMENT → IN_PROGRESS on first upload
 * 
 * When Razorpay is integrated:
 * - Set TEST_MODE = false
 * - Restore real payment verification logic
 * - Only requests with completed payments can upload progress
 */
const TEST_MODE = true; // TEMP: Set to false when Razorpay is integrated

/**
 * Add work progress update
 * POST /api/progress
 * Body: { requestId, title, description, completionPercent, files[] }
 */
export const addProgress = async (req, res) => {
    try {
        const { requestId, title, description, completionPercent } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only ADMIN can add progress
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can add work progress' });
        }

        // Validate required fields
        if (!requestId) {
            return res.status(400).json({ error: 'requestId is required' });
        }

        // Get request
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { user: true, service: true },
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Check request status allows progress updates (PAYMENT or IN_PROGRESS)
        if (!['PAYMENT', 'IN_PROGRESS'].includes(serviceRequest.status)) {
            return res.status(400).json({
                error: 'Progress can only be added for requests in PAYMENT or IN_PROGRESS status',
                currentStatus: serviceRequest.status,
            });
        }

        // TEMP/TEST MODE: Verify payment status or test mode
        if (serviceRequest.status === 'PAYMENT') {
            if (!TEST_MODE) {
                // PRODUCTION: Verify actual payment exists
                // TODO: When Razorpay integrated, verify payment.status === 'CAPTURED'
                return res.status(400).json({
                    error: 'Payment not verified. Razorpay integration pending.',
                    testMode: false,
                });
            } else {
                // TEST MODE: Allow PAYMENT status requests (Razorpay not integrated yet)
                console.log(`[TEST MODE] Allowing progress upload for PAYMENT status request: ${serviceRequest.requestCode}`);
            }
        }

        // Handle uploaded files (if any)
        const photos = [];
        const videos = [];
        const documents = [];

        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                req.files.image.forEach(file => {
                    photos.push(`/uploads/progress/${file.filename}`);
                });
            }
            if (req.files.video && req.files.video.length > 0) {
                req.files.video.forEach(file => {
                    videos.push(`/uploads/progress/${file.filename}`);
                });
            }
        }

        // Create progress record
        const progress = await prisma.workProgress.create({
            data: {
                requestId,
                userId,
                title: title || 'Progress Update',
                description: description || '',
                photos,
                videos,
                documents,
                completionPercent: parseInt(completionPercent) || 0,
            },
            include: {
                request: { include: { service: true, user: true } },
                user: true,
            },
        });

        // Update request status to IN_PROGRESS if it's in PAYMENT
        if (serviceRequest.status === 'PAYMENT') {
            await prisma.serviceRequest.update({
                where: { id: requestId },
                data: { status: 'IN_PROGRESS' },
            });
        }

        console.log(`[NOTIFICATION] Progress update added for request ${serviceRequest.requestCode} - notify user: ${serviceRequest.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Progress update added successfully',
            data: progress,
        });
    } catch (error) {
        console.error('Add progress error:', error);
        res.status(500).json({ error: 'Failed to add progress update', details: error.message });
    }
};

/**
 * Get progress updates by request ID
 * GET /api/progress/request/:requestId
 */
export const getProgressByRequestId = async (req, res) => {
    try {
        const { requestId } = req.params;

        const progress = await prisma.workProgress.findMany({
            where: { requestId },
            include: {
                request: { include: { service: true } },
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress,
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress updates', details: error.message });
    }
};

/**
 * Get all progress updates (admin only)
 * GET /api/progress
 */
export const listProgress = async (req, res) => {
    try {
        const userRole = req.user.role;

        // Only ADMIN can view all progress
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const progress = await prisma.workProgress.findMany({
            include: {
                request: { include: { service: true, user: true } },
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress,
        });
    } catch (error) {
        console.error('List progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress updates', details: error.message });
    }
};

/**
 * Delete progress update (admin only)
 * DELETE /api/progress/:id
 */
export const deleteProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        // Only ADMIN can delete
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can delete progress updates' });
        }

        const progress = await prisma.workProgress.findUnique({
            where: { id },
        });

        if (!progress) {
            return res.status(404).json({ error: 'Progress update not found' });
        }

        // Delete associated files if they exist
        [...progress.photos, ...progress.videos, ...progress.documents].forEach(fileUrl => {
            if (fileUrl) {
                const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        await prisma.workProgress.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Progress update deleted successfully',
        });
    } catch (error) {
        console.error('Delete progress error:', error);
        res.status(500).json({ error: 'Failed to delete progress update', details: error.message });
    }
};

/**
 * Mark request as completed
 * PUT /api/progress/complete/:requestId
 */
export const markAsCompleted = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userRole = req.user.role;

        // Only ADMIN can mark as completed
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can mark requests as completed' });
        }

        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { user: true, service: true },
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Check request is in IN_PROGRESS status
        if (serviceRequest.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                error: 'Only requests in IN_PROGRESS status can be marked as completed',
                currentStatus: serviceRequest.status,
            });
        }

        // Update to COMPLETED
        const updated = await prisma.serviceRequest.update({
            where: { id: requestId },
            data: { status: 'COMPLETED' },
            include: { service: true, user: true },
        });

        console.log(`[NOTIFICATION] Request ${serviceRequest.requestCode} marked as COMPLETED - notify user: ${serviceRequest.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Request marked as completed',
            request: updated,
        });
    } catch (error) {
        console.error('Mark completed error:', error);
        res.status(500).json({ error: 'Failed to mark request as completed', details: error.message });
    }
};

/**
 * TEMP/TEST MODE - Get eligible requests for progress upload
 * GET /api/progress/eligible
 * 
 * ⚠️ TEMPORARY: In TEST_MODE, returns all PAYMENT status requests
 * When Razorpay integrated: Return only requests with verified payments
 */
export const getEligibleRequests = async (req, res) => {
    try {
        const userRole = req.user.role;

        // TEMP: Only ADMIN can upload progress
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can upload progress' });
        }

        // TEMP: In TEST_MODE, show all PAYMENT status requests
        // When Razorpay integrated, query for verified payments instead
        let eligibleRequests;

        if (TEST_MODE) {
            // TEST MODE: Return all PAYMENT status requests
            eligibleRequests = await prisma.serviceRequest.findMany({
                where: {
                    status: 'PAYMENT'
                },
                include: {
                    service: true,
                    user: true,
                    quotations: {
                        where: { status: 'APPROVED' },
                        // Quotation has baseAmount/totalAmount (no amount field)
                        select: { id: true, baseAmount: true, totalAmount: true }
                    }
                }
            });
        } else {
            // PRODUCTION: Return requests with verified payments
            // (This will be implemented when Razorpay is integrated)
            eligibleRequests = await prisma.serviceRequest.findMany({
                where: {
                    status: 'PAYMENT'
                },
                include: {
                    service: true,
                    user: true,
                    quotations: {
                        where: { status: 'APPROVED' },
                        // Quotation has baseAmount/totalAmount (no amount field)
                        select: { id: true, baseAmount: true, totalAmount: true }
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            testMode: TEST_MODE,
            count: eligibleRequests.length,
            data: eligibleRequests,
        });
    } catch (error) {
        console.error('Get eligible requests error:', error);
        res.status(500).json({ error: 'Failed to fetch eligible requests', details: error.message });
    }
};

