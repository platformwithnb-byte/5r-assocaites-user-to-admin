/**
 * API Service - Handle all API calls
 * Centralized API management with token handling
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get stored JWT token
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Set JWT token
 */
export const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

/**
 * Prepare headers with authentication
 */
const getHeaders = (includeAuth = true) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (includeAuth && getToken()) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }

    return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
    let data;

    try {
        data = await response.json();
    } catch (e) {
        // If response is not JSON, create error from status
        data = { message: `HTTP ${response.status}` };
    }

    if (!response.ok) {
        // Log the error response for debugging
        console.error('Backend error response:', data);

        const errorMessage = data.message || data.error || `HTTP ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

/**
 * Generic API request handler
 */
const apiRequest = async (method, endpoint, body = null, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        method,
        headers: getHeaders(options.includeAuth !== false),
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    // Log request for debugging
    console.log(`API Request [${method} ${endpoint}]:`, {
        body: body ? body : 'no body',
        headers: config.headers,
    });

    try {
        const response = await fetch(url, config);
        return await handleResponse(response);
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
};

// Auth APIs
export const authAPI = {
    login: (email, password) =>
        apiRequest('POST', '/auth/login', { email, password }, { includeAuth: false }),

    signup: (userData) =>
        apiRequest('POST', '/auth/signup', userData, { includeAuth: false }),

    logout: () => {
        setToken(null);
        return Promise.resolve({ success: true });
    },

    verifyToken: () => apiRequest('GET', '/auth/verify', null),
};

// Service Request APIs
export const requestAPI = {
    create: (data) => apiRequest('POST', '/requests', data),

    list: () => apiRequest('GET', '/requests'),

    getById: (id) => apiRequest('GET', `/requests/${id}`),

    update: (id, data) => apiRequest('PUT', `/requests/${id}`, data),

    updateStatus: (id, status) =>
        apiRequest('PUT', `/requests/${id}/status`, { status }),
};

// Quotation APIs
export const quotationAPI = {
    create: (data) => apiRequest('POST', '/quotations', data),

    getByRequestId: (requestId) =>
        apiRequest('GET', `/quotations/request/${requestId}`),

    getById: (id) => apiRequest('GET', `/quotations/${id}`),

    update: (id, data) => apiRequest('PUT', `/quotations/${id}`, data),

    approve: (id) => apiRequest('PUT', `/quotations/${id}/approve`),

    reject: (id) => apiRequest('PUT', `/quotations/${id}/reject`),
};

// Payment APIs
export const paymentAPI = {
    initiate: (data) => apiRequest('POST', '/payments/init', data),

    getStatus: (id) => apiRequest('GET', `/payments/${id}`),

    list: () => apiRequest('GET', '/payments'),

    listByRequest: (requestId) =>
        apiRequest('GET', `/payments/request/${requestId}`),
};

// Work Progress APIs
export const progressAPI = {
    add: (data, files = null) => {
        if (files) {
            // Handle file upload
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
            files.forEach((file) => {
                formData.append('files', file);
            });

            return fetch(`${API_BASE_URL}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: formData,
            }).then(handleResponse);
        }

        return apiRequest('POST', '/progress', data);
    },

    getByRequestId: (requestId) =>
        apiRequest('GET', `/progress/request/${requestId}`),
};

// PDF APIs
export const pdfAPI = {
    downloadQuotation: (id) => {
        window.open(`${API_BASE_URL}/pdf/quotation/${id}`, '_blank');
    },

    downloadInvoice: (id) => {
        window.open(`${API_BASE_URL}/pdf/invoice/${id}`, '_blank');
    },
};

// Reminder APIs
export const reminderAPI = {
    list: () => apiRequest('GET', '/reminders'),

    markAsSent: (id) =>
        apiRequest('PUT', `/reminders/${id}/mark-sent`),
};

export default {
    getToken,
    setToken,
    authAPI,
    requestAPI,
    quotationAPI,
    paymentAPI,
    progressAPI,
    pdfAPI,
    reminderAPI,
};
