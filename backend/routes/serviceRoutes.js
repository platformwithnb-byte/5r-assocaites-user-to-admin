import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get all services
 * GET /api/services
 */
router.get('/', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: {
                code: 'asc',
            },
        });

        res.status(200).json({
            success: true,
            services,
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

/**
 * Get service by ID
 * GET /api/services/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const service = await prisma.service.findUnique({
            where: { id },
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.status(200).json({
            success: true,
            service,
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

export default router;
