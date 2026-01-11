import express from 'express';
import {
    generateInvoice,
    getInvoice,
    getInvoicesByRequest,
    listInvoices,
    markInvoicePaid,
    getCompanyInfo,
} from '../controllers/invoiceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get company info (public)
router.get('/company-info', getCompanyInfo);

// All other routes require authentication
router.use(authenticateToken);

// Generate invoice
router.post('/', generateInvoice);

// Get invoice by ID
router.get('/:invoiceId', getInvoice);

// Get invoices for a request
router.get('/request/:requestId', getInvoicesByRequest);

// Mark invoice as paid (admin)
router.put('/:invoiceId/paid', markInvoicePaid);

// List all invoices (admin)
router.get('/', listInvoices);

export default router;
