/**
 * Frontend Services List
 * Predefined services for 5R Associates
 */

export const services = [
    {
        id: 'PAINT-001',
        code: 'PAINT-001',
        name: 'Painting',
        description: 'Residential and commercial painting services',
    },
    {
        id: 'CONST-002',
        code: 'CONST-002',
        name: 'Construction',
        description: 'Construction and structural work',
    },
    {
        id: 'INTER-003',
        code: 'INTER-003',
        name: 'Interior Design',
        description: 'Interior design and decoration',
    },
    {
        id: 'RENOV-004',
        code: 'RENOV-004',
        name: 'Renovation',
        description: 'Home renovation and remodeling',
    },
    {
        id: 'MSFAB-005',
        code: 'MSFAB-005',
        name: 'MS & SS Fabrication',
        description: 'Mild Steel and Stainless Steel fabrication',
    },
];

/**
 * Get all services
 */
export const getAllServices = () => {
    return services;
};

/**
 * Get service by ID or code
 */
export const getServiceById = (id) => {
    return services.find(s => s.id === id || s.code === id);
};

/**
 * Get service by code
 */
export const getServiceByCode = (code) => {
    return services.find(s => s.code === code);
};

export default {
    services,
    getAllServices,
    getServiceById,
    getServiceByCode,
};
