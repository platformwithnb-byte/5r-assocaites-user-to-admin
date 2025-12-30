import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '7d',

    // Razorpay
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },

    // SendGrid
    sendGrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@5r-associates.com',
    },

    // Company Info
    company: {
        name: process.env.COMPANY_NAME || '5R Associates Communications',
        address: process.env.COMPANY_ADDRESS || 'Address',
        phone: process.env.COMPANY_PHONE || 'Phone',
        email: process.env.COMPANY_EMAIL || 'admin@5r-associates.com',
    },

    // GST
    gst: {
        rate: parseFloat(process.env.GST_RATE || '18'),
        number: process.env.GST_NUMBER || 'To be provided',
    },

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        uploadDir: process.env.UPLOAD_DIR || 'backend/uploads',
        allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,mp4').split(','),
    },
};

export default config;
