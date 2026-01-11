import fetch from 'node-fetch';

async function testLogin() {
    try {
        console.log('\n🧪 Testing Login API...\n');

        const credentials = {
            email: 'veeramanojaohmb@gmail.com',
            password: 'admin123'
        };

        console.log(`Attempting login with: ${credentials.email}`);

        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        console.log(`Response Status: ${response.status}`);

        const data = await response.json();
        console.log('\nResponse Data:');
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Login successful!');
            if (data.token) {
                console.log(`Token: ${data.token.substring(0, 20)}...`);
            }
        } else {
            console.log('\n❌ Login failed');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLogin();
