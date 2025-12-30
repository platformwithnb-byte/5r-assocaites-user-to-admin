import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Workflow State Machine Validation
 * Ensures requests follow fixed workflow: REQUESTED → QUOTED → APPROVED → PAYMENT → IN_PROGRESS → COMPLETED
 */

const workflowSequence = ['REQUESTED', 'QUOTED', 'APPROVED', 'PAYMENT', 'IN_PROGRESS', 'COMPLETED'];

const canTransition = (currentStatus, nextStatus) => {
    const currentIndex = workflowSequence.indexOf(currentStatus);
    const nextIndex = workflowSequence.indexOf(nextStatus);

    // Can only move to next status in sequence (no skipping)
    if (nextIndex === currentIndex + 1) {
        return true;
    }

    // Cannot go backwards or skip
    return false;
};

export const validateWorkflowTransition = (req, res, next) => {
    req.canTransition = canTransition;
    req.getWorkflowSequence = () => workflowSequence;
    next();
};

/**
 * Middleware to prevent workflow skipping
 * Call this before updating status
 */
export const checkWorkflowTransition = async (req, res, next) => {
    try {
        const { requestId, newStatus } = req.body;

        if (!requestId || !newStatus) {
            return res.status(400).json({ error: 'requestId and newStatus required' });
        }

        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        if (!canTransition(serviceRequest.status, newStatus)) {
            return res.status(400).json({
                error: `Cannot transition from ${serviceRequest.status} to ${newStatus}`,
                currentStatus: serviceRequest.status,
                allowedStatus: workflowSequence[workflowSequence.indexOf(serviceRequest.status) + 1],
            });
        }

        req.serviceRequest = serviceRequest;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Workflow validation failed', details: error.message });
    }
};

export default {
    canTransition,
    validateWorkflowTransition,
    checkWorkflowTransition,
    workflowSequence,
};
