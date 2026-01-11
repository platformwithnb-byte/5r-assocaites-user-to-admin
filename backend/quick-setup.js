import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function setup() {
    try {
        console.log('\n📋 Setting up test credentials...\n');

        // Delete all users and recreate with known passwords
        await prisma.user.deleteMany({});
        console.log('Cleared all users');

        // Create admin
        const adminPassword = await bcryptjs.hash('Admin@123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@test.com',
                password: adminPassword,
                name: 'Admin',
                phone: '9999999999',
                role: 'ADMIN',
            },
        });
        console.log(`✓ Created Admin: ${admin.email}`);

        // Create user
        const userPassword = await bcryptjs.hash('User@123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'user@test.com',
                password: userPassword,
                name: 'Test User',
                phone: '8888888888',
                role: 'USER',
            },
        });
        console.log(`✓ Created User: ${user.email}`);

        console.log('\n✅ Setup Complete!\n');
        console.log('=== USE THESE CREDENTIALS ===\n');
        console.log('ADMIN Login:');
        console.log('  Email: admin@test.com');
        console.log('  Password: Admin@123\n');
        console.log('USER Login:');
        console.log('  Email: user@test.com');
        console.log('  Password: User@123\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setup();
