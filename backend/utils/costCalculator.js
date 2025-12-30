import { config } from '../config/config.js';

/**
 * Cost Calculation Utility
 * Formula: Base Amount → Service Tax → GST (18% of Base) → Total
 * GST is calculated ONLY on base amount, not on service tax
 */

export const calculateGST = (baseAmount) => {
    return parseFloat((baseAmount * (config.gst.rate / 100)).toFixed(2));
};

export const calculateTotal = (baseAmount, serviceTax) => {
    const gst = calculateGST(baseAmount);
    return parseFloat((baseAmount + serviceTax + gst).toFixed(2));
};

export const getCostBreakdown = (baseAmount, serviceTax) => {
    const gst = calculateGST(baseAmount);
    const total = calculateTotal(baseAmount, serviceTax);

    return {
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        serviceTax: parseFloat(serviceTax.toFixed(2)),
        gstRate: config.gst.rate,
        gstAmount: gst,
        totalPrice: total,
        gstNumber: config.gst.number,
    };
};

/**
 * Validate cost inputs
 */
export const validateCostInputs = (baseAmount, serviceTax) => {
    const errors = [];

    if (!baseAmount || baseAmount <= 0) {
        errors.push('Base service amount must be greater than 0');
    }

    if (serviceTax < 0) {
        errors.push('Service tax cannot be negative');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export default {
    calculateGST,
    calculateTotal,
    getCostBreakdown,
    validateCostInputs,
};
