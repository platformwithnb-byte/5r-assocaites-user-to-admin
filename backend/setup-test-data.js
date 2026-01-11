import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function setupTestData() {
    try {
        console.log('\n📋 Setting up test data...\n');

        // Check existing users
        const existingUsers = await prisma.user.findMany();

        if (existingUsers.length === 0) {
            console.log('Creating test users...');

            // Create admin user
            const adminPassword = await bcryptjs.hash('admin123', 10);
            const admin = await prisma.user.create({
                data: {
                    email: 'admin@5r-associates.com',
                    password: adminPassword,
                    name: 'Admin User',
                    phone: '9876543210',
                    role: 'ADMIN',
                    address: 'Bangalore, India',
                },
            });
            console.log(`✓ Admin created: ${admin.email}`);

            // Create regular user
            const userPassword = await bcryptjs.hash('user123', 10);
            const user = await prisma.user.create({
                data: {
                    email: 'platformwithnb@gmail.com',
                    password: userPassword,
                    name: 'Test User',
                    phone: '9123456789',
                    role: 'USER',
                    address: 'Mumbai, India',
                },
            });
            console.log(`✓ User created: ${user.email}`);
        } else {
            console.log(`✓ Found ${existingUsers.length} existing users`);
            existingUsers.forEach(u => {
                console.log(`  - ${u.email} (${u.role})`);
            });
        }

        console.log('\n✅ Test data setup complete!\n');
        console.log('Test Credentials:');
        console.log('  Admin Email: admin@5r-associates.com');
        console.log('  Admin Password: admin123');
        console.log('  User Email: platformwithnb@gmail.com');
        console.log('  User Password: user123\n');

    } catch (error) {
        console.error('❌ Setup error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setupTestData();
