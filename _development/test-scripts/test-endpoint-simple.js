// Simple test using fetch with proper error handling
import jwt from 'jsonwebtoken';

const TOKEN_SECRET = process.env.JWT_SECRET || 'test-secret-key-5r-associates';

// Create a test token
const token = jwt.sign(
    { id: 'test-admin', email: 'admin@test.com', role: 'ADMIN' },
    TOKEN_SECRET,
    { expiresIn: '7d' }
);

async function testEndpoint() {
    try {
        console.log('\n📝 Testing GET /api/progress/eligible endpoint...\n');
        console.log('Token created:', token.substring(0, 30) + '...');

        const response = await fetch('http://localhost:5000/api/progress/eligible', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Error code:', error.code);
    }
}

testEndpoint();
