import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function debugLogin() {
    try {
        console.log('\n🔍 Debugging Login Issues...\n');

        // 1. Check if users exist
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
            }
        });

        console.log(`📋 Users in database: ${users.length}`);
        if (users.length === 0) {
            console.log('   ❌ No users found! Need to create test users.');
            console.log('\n   Creating test users...\n');

            // Create admin user
            const adminPassword = await bcryptjs.hash('admin123', 10);
            const admin = await prisma.user.create({
                data: {
                    email: 'admin@5r.com',
                    name: 'Admin User',
                    password: adminPassword,
                    phone: '9876543210',
                    role: 'ADMIN',
                }
            });
            console.log(`   ✅ Admin created: ${admin.email}`);

            // Create user
            const userPassword = await bcryptjs.hash('user123', 10);
            const user = await prisma.user.create({
                data: {
                    email: 'platformwithnb@gmail.com',
                    name: 'User Test',
                    password: userPassword,
                    phone: '9876543211',
                    role: 'USER',
                }
            });
            console.log(`   ✅ User created: ${user.email}`);

        } else {
            console.log('\n   Users found:');
            users.forEach(u => {
                console.log(`   - ${u.email} (${u.role}) - Name: ${u.name}`);
                console.log(`     Password hash: ${u.password.substring(0, 20)}...`);
            });
        }

        // 2. Test password comparison
        console.log('\n🔐 Testing password hashing...\n');
        const testPassword = 'testpass123';
        const hashedPassword = await bcryptjs.hash(testPassword, 10);
        const isMatch = await bcryptjs.compare(testPassword, hashedPassword);
        console.log(`   Password hash test: ${isMatch ? '✅ PASS' : '❌ FAIL'}`);

        // 3. Test login simulation
        console.log('\n🔑 Testing login simulation...\n');
        if (users.length > 0) {
            const testUser = users[0];
            console.log(`   Testing login for: ${testUser.email}`);

            // Try to compare the actual password in DB
            console.log(`   Database password hash: ${testUser.password}`);
            console.log(`   Password field exists: ${testUser.password ? 'YES' : 'NO'}`);
        }

        console.log('\n✅ Debug complete\n');

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLogin();
