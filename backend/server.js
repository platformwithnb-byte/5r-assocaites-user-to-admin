import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config/config.js';
import { authenticateToken, authorize } from './middleware/auth.js';
import { validateWorkflowTransition } from './middleware/workflow.js';

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(config.upload.uploadDir));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API Routes (to be implemented)
// app.use('/api/auth', authRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/quotations', quotationRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/progress', progressRoutes);
// app.use('/api/reminders', reminderRoutes);
// app.use('/api/pdf', pdfRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
    });
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('Error:', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    res.status(statusCode).json({
        error: message,
        ...(config.nodeEnv === 'development' && { stack: error.stack }),
    });
});

// Start Server
const PORT = config.port;

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✓ Database connected');

        // Start listening
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║  5R Associates - Construction Service Platform             ║
║  Server running on http://localhost:${PORT}                      ║
║  Environment: ${config.nodeEnv}                                  ║
║  Frontend: ${config.frontendUrl}                 ║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('✗ Failed to start server:');
        console.error('  Database connection failed:', error.message);
        console.error('  Make sure PostgreSQL is running and DATABASE_URL is configured in .env');
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();

export default app;
