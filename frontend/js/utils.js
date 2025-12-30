/**
 * Utility Functions
 */

/**
 * Format currency (INR)
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

/**
 * Format datetime
 */
export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Validate phone
 */
export const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
};

/**
 * Show notification
 */
export const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration);
};

/**
 * Show loading state
 */
export const showLoading = (element) => {
    element.disabled = true;
    element.innerHTML = '<span class="spinner"></span> Loading...';
};

/**
 * Hide loading state
 */
export const hideLoading = (element, text) => {
    element.disabled = false;
    element.textContent = text;
};

/**
 * Get workflow status color
 */
export const getStatusColor = (status) => {
    const colors = {
        REQUESTED: '#3498db',
        QUOTED: '#f39c12',
        APPROVED: '#27ae60',
        PAYMENT: '#e74c3c',
        IN_PROGRESS: '#9b59b6',
        COMPLETED: '#2ecc71',
    };
    return colors[status] || '#95a5a6';
};

/**
 * Get workflow status badge
 */
export const getStatusBadge = (status) => {
    return `<span class="badge badge-${status.toLowerCase()}">${status}</span>`;
};

/**
 * Create table from data
 */
export const createTable = (headers, rows) => {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((row) => {
        const tr = document.createElement('tr');
        Object.values(row).forEach((cell) => {
            const td = document.createElement('td');
            td.innerHTML = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

/**
 * Set user data to localStorage
 */
export const setUserData = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

/**
 * Logout user
 */
export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/frontend/pages/auth/login.html';
};

/**
 * Redirect to login if not authenticated
 */
export const requireAuth = () => {
    if (!isLoggedIn()) {
        window.location.href = '/frontend/pages/auth/login.html';
    }
};

export default {
    formatCurrency,
    formatDate,
    formatDateTime,
    validateEmail,
    validatePhone,
    showNotification,
    showLoading,
    hideLoading,
    getStatusColor,
    getStatusBadge,
    createTable,
    isLoggedIn,
    getUserData,
    setUserData,
    logoutUser,
    requireAuth,
};
