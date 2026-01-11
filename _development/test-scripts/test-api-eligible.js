// Test the /api/progress/eligible endpoint
import jwt from 'jsonwebtoken';

const SERVER_URL = 'http://localhost:5000';
const TOKEN_SECRET = process.env.JWT_SECRET || 'test-secret-key-5r-associates';

// Create a test token for admin user
const token = jwt.sign(
    { id: 'test-admin-id', email: 'admin@test.com', role: 'ADMIN' },
    TOKEN_SECRET,
    { expiresIn: '7d' }
);

async function testEligibleEndpoint() {
    try {
        console.log('\n📝 Testing GET /api/progress/eligible endpoint...\n');

        const response = await fetch(`${SERVER_URL}/api/progress/eligible`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Status: 200 OK');
            console.log(`✓ Test Mode: ${data.testMode}`);
            console.log(`✓ Count: ${data.count} eligible requests\n`);

            if (data.data && data.data.length > 0) {
                console.log('Eligible Projects for Progress Upload:');
                data.data.forEach(req => {
                    console.log(`  - ${req.requestCode} | ${req.service.name} | Status: ${req.status}`);
                });
            } else {
                console.log('No eligible projects found');
            }
        } else {
            console.log('✗ Error:', response.status, data.error);
        }

        console.log('\n✓ Endpoint test complete!');
        console.log('  Frontend progress upload form will now show these projects.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEligibleEndpoint();
