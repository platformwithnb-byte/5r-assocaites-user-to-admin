import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';

/**
 * PDF Generation for Quotations and Invoices
 * Supports bilingual output (English/Kannada)
 */

export const generateQuotationPDF = async (quotationData, language = 'en') => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `quotation-${quotationData.id}.pdf`;
            const filePath = path.join(config.upload.uploadDir, fileName);

            // Ensure uploads directory exists
            if (!fs.existsSync(config.upload.uploadDir)) {
                fs.mkdirSync(config.upload.uploadDir, { recursive: true });
            }

            const doc = new PDFDocument({
                size: 'A4',
                margin: 40,
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header with company info
            doc.fontSize(16).font('Helvetica-Bold').text(config.company.name, { align: 'left' });
            doc.fontSize(10).font('Helvetica').text(`GST No: ${config.gst.number}`, { align: 'left' });
            doc.fontSize(9).text(`${config.company.address}`, { align: 'left' });
            doc.text(`Phone: ${config.company.phone} | Email: ${config.company.email}`, { align: 'left' });

            doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown();

            // Document title
            doc.fontSize(14).font('Helvetica-Bold').text('SERVICE QUOTATION', { align: 'center' });
            doc.moveDown(0.5);

            // Service and quotation details
            doc.fontSize(10).font('Helvetica');
            doc.text(`Service Code: ${quotationData.serviceCode}`, { width: 250 });
            doc.text(`Date: ${new Date(quotationData.createdAt).toLocaleDateString()}`, { width: 250 });
            doc.moveDown(0.3);

            // Client info
            doc.fontSize(10).font('Helvetica-Bold').text('Client Details:');
            doc.fontSize(9).font('Helvetica');
            doc.text(`Name: ${quotationData.userName}`);
            doc.text(`Email: ${quotationData.userEmail}`);
            doc.text(`Phone: ${quotationData.userPhone}`);
            doc.text(`Address: ${quotationData.userAddress}`);
            doc.moveDown();

            // Service details
            doc.fontSize(10).font('Helvetica-Bold').text('Service Details:');
            doc.fontSize(9).font('Helvetica');
            doc.text(`Requirements: ${quotationData.requirements}`);
            doc.text(`Location: ${quotationData.location}`);
            if (quotationData.notes) {
                doc.text(`Notes: ${quotationData.notes}`);
            }
            doc.moveDown();

            // Cost breakdown table
            doc.fontSize(10).font('Helvetica-Bold').text('Cost Breakdown:');
            doc.moveDown(0.3);

            const tableTop = doc.y;
            const col1 = 40;
            const col2 = 350;
            const col3 = 450;
            const rowHeight = 25;

            // Table header
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('Description', col1, tableTop);
            doc.text('Amount', col2, tableTop);
            doc.text('₹', col3, tableTop);

            doc.moveTo(40, tableTop + 18).lineTo(555, tableTop + 18).stroke();

            // Table rows
            doc.fontSize(9).font('Helvetica');
            let currentY = tableTop + 25;

            const rows = [
                { label: 'Base Service Amount', value: quotationData.baseServiceAmount },
                { label: 'Service Tax', value: quotationData.serviceTax },
                { label: `GST (${config.gst.rate}%)`, value: quotationData.gstAmount },
            ];

            rows.forEach((row) => {
                doc.text(row.label, col1, currentY);
                doc.text(row.value.toFixed(2), col3, currentY, { align: 'right' });
                currentY += rowHeight;
            });

            // Total row
            doc.moveTo(40, currentY - 10).lineTo(555, currentY - 10).stroke();
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Total Price', col1, currentY);
            doc.text(`₹ ${quotationData.totalPrice.toFixed(2)}`, col3, currentY, { align: 'right' });

            currentY += rowHeight;
            doc.moveTo(40, currentY - 10).lineTo(555, currentY - 10).stroke();

            doc.moveDown(2);

            // Terms
            doc.fontSize(8).font('Helvetica-Bold').text('Terms & Conditions:');
            doc.fontSize(8).font('Helvetica');
            doc.text('1. This is a quotation valid for 30 days from the date of issue.');
            doc.text('2. Payment terms and conditions will be discussed with the client.');
            doc.text('3. All costs are exclusive of any additional charges not mentioned above.');

            doc.moveDown(1);
            doc.fontSize(8).text('Generated on: ' + new Date().toLocaleString());

            doc.end();

            stream.on('finish', () => {
                resolve({
                    success: true,
                    fileName,
                    filePath,
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const generateInvoicePDF = async (invoiceData, language = 'en') => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `invoice-${invoiceData.id}.pdf`;
            const filePath = path.join(config.upload.uploadDir, fileName);

            // Ensure uploads directory exists
            if (!fs.existsSync(config.upload.uploadDir)) {
                fs.mkdirSync(config.upload.uploadDir, { recursive: true });
            }

            const doc = new PDFDocument({
                size: 'A4',
                margin: 40,
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Similar structure as quotation but marked as invoice
            doc.fontSize(16).font('Helvetica-Bold').text(config.company.name, { align: 'left' });
            doc.fontSize(10).font('Helvetica').text(`GST No: ${config.gst.number}`, { align: 'left' });
            doc.fontSize(9).text(`${config.company.address}`, { align: 'left' });
            doc.text(`Phone: ${config.company.phone} | Email: ${config.company.email}`, { align: 'left' });

            doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown();

            doc.fontSize(14).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(0.5);

            doc.fontSize(10).font('Helvetica');
            doc.text(`Service Code: ${invoiceData.serviceCode}`, { width: 250 });
            doc.text(`Invoice Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}`, {
                width: 250,
            });
            doc.moveDown();

            // Cost breakdown (same as quotation)
            doc.fontSize(10).font('Helvetica-Bold').text('Cost Breakdown:');
            doc.moveDown(0.3);

            const tableTop = doc.y;
            const col1 = 40;
            const col3 = 450;
            const rowHeight = 25;

            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('Description', col1, tableTop);
            doc.text('Amount (₹)', col3, tableTop);
            doc.moveTo(40, tableTop + 18).lineTo(555, tableTop + 18).stroke();

            doc.fontSize(9).font('Helvetica');
            let currentY = tableTop + 25;

            const rows = [
                { label: 'Base Service Amount', value: invoiceData.baseServiceAmount },
                { label: 'Service Tax', value: invoiceData.serviceTax },
                { label: `GST (${config.gst.rate}%)`, value: invoiceData.gstAmount },
            ];

            rows.forEach((row) => {
                doc.text(row.label, col1, currentY);
                doc.text(row.value.toFixed(2), col3, currentY, { align: 'right' });
                currentY += rowHeight;
            });

            doc.moveTo(40, currentY - 10).lineTo(555, currentY - 10).stroke();
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Total Amount Due', col1, currentY);
            doc.text(`₹ ${invoiceData.totalPrice.toFixed(2)}`, col3, currentY, { align: 'right' });

            currentY += rowHeight;
            doc.moveTo(40, currentY - 10).lineTo(555, currentY - 10).stroke();

            doc.moveDown(2);
            doc.fontSize(8).text('Generated on: ' + new Date().toLocaleString());

            doc.end();

            stream.on('finish', () => {
                resolve({
                    success: true,
                    fileName,
                    filePath,
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

export default {
    generateQuotationPDF,
    generateInvoicePDF,
};
