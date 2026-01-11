/**
 * Test Login API
 */

async function testLogin() {
    const email = 'platformwithnb@gmail.com';
    const password = 'user123';  // Default password for existing users

    console.log('\n🔑 Testing Login API...\n');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message}`);

        if (data.token) {
            console.log(`   Token: ${data.token.substring(0, 50)}...`);
            console.log(`   ✅ Login successful!`);
        } else if (data.error || data.message) {
            console.log(`   ❌ Login failed: ${data.error || data.message}`);
        }

        console.log('\n   Full response:');
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
}

testLogin();
