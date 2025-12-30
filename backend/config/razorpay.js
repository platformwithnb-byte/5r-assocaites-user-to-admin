import Razorpay from 'razorpay';
import { config } from './config.js';

if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    console.warn('⚠️  Razorpay credentials not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
}

export const razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId || 'KEY_ID_PLACEHOLDER',
    key_secret: config.razorpay.keySecret || 'KEY_SECRET_PLACEHOLDER',
});

export default razorpayInstance;
