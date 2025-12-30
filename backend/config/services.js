// Service types with predefined codes
// Format: CODE-XXXXX (e.g., PAINT-001)

export const services = [
    {
        code: 'PAINT-001',
        name: 'Painting',
        description: 'Residential and commercial painting services',
    },
    {
        code: 'CONST-002',
        name: 'Construction',
        description: 'Construction and structural work',
    },
    {
        code: 'INTER-003',
        name: 'Interior Design',
        description: 'Interior design and decoration',
    },
    {
        code: 'RENOV-004',
        name: 'Renovation',
        description: 'Home renovation and remodeling',
    },
    {
        code: 'MSFAB-005',
        name: 'MS & SS Fabrication',
        description: 'Mild Steel and Stainless Steel fabrication',
    },
];

// Get service by code
export const getServiceByCode = (code) => {
    return services.find((service) => service.code === code);
};

// Get all services
export const getAllServices = () => {
    return services;
};

// Generate next service code (auto-increment if needed)
export const generateNextServiceCode = (baseCode) => {
    // Current implementation uses predefined codes
    // For future: can implement auto-increment logic
    return baseCode;
};
