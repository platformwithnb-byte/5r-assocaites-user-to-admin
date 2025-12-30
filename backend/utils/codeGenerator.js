import { v4 as uuidv4 } from 'uuid';

/**
 * Service Code Assignment Utility
 * Each service request gets a unique identifier
 * Format: SVC-YYYYMMDD-XXXX (e.g., SVC-20251230-0001)
 */

let requestCounter = 0;

const resetCounterDaily = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    if (!resetCounterDaily.lastReset || resetCounterDaily.lastReset !== todayString) {
        requestCounter = 0;
        resetCounterDaily.lastReset = todayString;
    }
};

export const generateServiceRequestId = () => {
    resetCounterDaily();
    requestCounter += 1;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const counter = String(requestCounter).padStart(4, '0');

    return `SVC-${year}${month}${day}-${counter}`;
};

/**
 * Generate unique IDs for various entities
 */
export const generateId = () => uuidv4();

export const generateQuotationNumber = (serviceRequestId) => {
    // Format: QT-{date}-{serviceRequestId-short}
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const short = serviceRequestId.substring(0, 8).toUpperCase();

    return `QT-${year}${month}${day}-${short}`;
};

export const generateInvoiceNumber = (quotationId) => {
    // Format: INV-{date}-{quotationId-short}
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const short = quotationId.substring(0, 8).toUpperCase();

    return `INV-${year}${month}${day}-${short}`;
};

export default {
    generateServiceRequestId,
    generateId,
    generateQuotationNumber,
    generateInvoiceNumber,
};
