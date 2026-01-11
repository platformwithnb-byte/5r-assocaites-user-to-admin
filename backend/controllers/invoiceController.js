import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

const prisma = new PrismaClient();

/**
 * Generate Invoice for Advance Payment
 * POST /api/invoices
 * Body: { advancePaymentId, requestId, quotationId }
 */
export const generateInvoice = async (req, res) => {
    try {
        const { advancePaymentId, requestId, quotationId } = req.body;
        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can generate invoices' });
        }

        // Get advance payment details
        const advancePayment = await prisma.advancePayment.findUnique({
            where: { id: advancePaymentId },
            include: { request: { include: { service: true, user: true } } },
        });

        if (!advancePayment) {
            return res.status(404).json({ error: 'Advance payment not found' });
        }

        // Get quotation details
        const quotation = await prisma.quotation.findUnique({
            where: { id: quotationId },
        });

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Calculate GST on advance amount
        const gstRate = config.gst.rate || 18;
        const baseAmount = advancePayment.advanceAmount;
        const gstAmount = (baseAmount * gstRate) / 100;
        const totalAmount = baseAmount + gstAmount;

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                requestId: advancePayment.requestId,
                quotationId,
                advancePaymentId,
                companyName: config.company.name,
                gstNumber: config.gst.number,
                gstRate,
                itemDescription: `Advance Payment - ${advancePayment.stage}`,
                baseAmount,
                gstAmount,
                totalAmount,
                advanceAmount: baseAmount,
                balanceAmount: quotation.totalAmount - baseAmount,
                status: 'ISSUED',
            },
            include: {
                request: { include: { service: true, user: true } },
            },
        });

        // Link invoice to advance payment
        await prisma.advancePayment.update({
            where: { id: advancePaymentId },
            data: { invoiceId: invoice.id },
        });

        console.log(`[INVOICE] Generated invoice ${invoiceNumber} for request ${advancePayment.request.requestCode}`);

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: invoice,
        });
    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({ error: 'Failed to generate invoice', details: error.message });
    }
};

/**
 * Get Invoice Details
 * GET /api/invoices/:invoiceId
 */
export const getInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                request: { include: { service: true, user: true } },
            },
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ error: 'Failed to fetch invoice', details: error.message });
    }
};

/**
 * Get Invoices by Request
 * GET /api/invoices/request/:requestId
 */
export const getInvoicesByRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const invoices = await prisma.invoice.findMany({
            where: { requestId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices,
        });
    } catch (error) {
        console.error('Get invoices by request error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices', details: error.message });
    }
};

/**
 * List All Invoices (Admin)
 * GET /api/invoices
 */
export const listInvoices = async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can list all invoices' });
        }

        const invoices = await prisma.invoice.findMany({
            include: {
                request: { include: { service: true, user: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices,
        });
    } catch (error) {
        console.error('List invoices error:', error);
        res.status(500).json({ error: 'Failed to list invoices', details: error.message });
    }
};

/**
 * Mark Invoice as Paid
 * PUT /api/invoices/:invoiceId/paid
 */
export const markInvoicePaid = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can mark invoices as paid' });
        }

        const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID' },
            include: { request: true },
        });

        console.log(`[INVOICE] Invoice ${invoice.invoiceNumber} marked as paid`);

        res.status(200).json({
            success: true,
            message: 'Invoice marked as paid',
            data: invoice,
        });
    } catch (error) {
        console.error('Mark invoice paid error:', error);
        res.status(500).json({ error: 'Failed to mark invoice as paid', details: error.message });
    }
};

/**
 * Get Company Info (for display on invoices)
 * GET /api/company-info
 */
export const getCompanyInfo = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                companyName: config.company.name,
                gstNumber: config.gst.number,
                address: config.company.address,
                phone: config.company.phone,
                email: config.company.email,
                gstRate: config.gst.rate,
            },
        });
    } catch (error) {
        console.error('Get company info error:', error);
        res.status(500).json({ error: 'Failed to fetch company info', details: error.message });
    }
};
