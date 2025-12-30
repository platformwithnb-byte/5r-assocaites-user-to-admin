import nodemailer from 'nodemailer';
import { config } from './config.js';

let emailTransporter;

if (config.sendGrid.apiKey) {
    // Use SendGrid if available
    emailTransporter = nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey',
            pass: config.sendGrid.apiKey,
        },
    });
    console.log('✓ Email service: SendGrid configured');
} else {
    // Fallback to console logging in development
    emailTransporter = {
        sendMail: async (mailOptions) => {
            console.log('📧 Email would be sent (SendGrid not configured):');
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Message: ${mailOptions.text}`);
            return { accepted: [mailOptions.to] };
        },
    };
    console.warn('⚠️  SendGrid not configured. Emails will log to console.');
}

export const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: config.sendGrid.fromEmail,
            to,
            subject,
            text,
            html: html || text,
        };

        const result = await emailTransporter.sendMail(mailOptions);
        console.log(`✓ Email sent to ${to}`);
        return result;
    } catch (error) {
        console.error(`✗ Email sending failed to ${to}:`, error.message);
        throw error;
    }
};

export default emailTransporter;
