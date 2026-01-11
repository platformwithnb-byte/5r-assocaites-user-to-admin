import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAllPasswords() {
    try {
        console.log('\n🔄 Resetting all test user passwords...\n');

        // Password to set
        const adminPassword = await bcryptjs.hash('admin123', 10);
        const userPassword = await bcryptjs.hash('user123', 10);

        // Update/create admin user
        const admin = await prisma.user.upsert({
            where: { email: 'admin@5r-associates.com' },
            update: { password: adminPassword },
            create: {
                email: 'admin@5r-associates.com',
                password: adminPassword,
                name: 'Admin User',
                phone: '9876543210',
                role: 'ADMIN',
                address: 'Bangalore, India',
            },
        });
        console.log(`✓ Admin: ${admin.email}`);

        // Update existing user or create new one
        const user = await prisma.user.upsert({
            where: { email: 'platformwithnb@gmail.com' },
            update: { password: userPassword },
            create: {
                email: 'platformwithnb@gmail.com',
                password: userPassword,
                name: 'Test User',
                phone: '9123456789',
                role: 'USER',
                address: 'Mumbai, India',
            },
        });
        console.log(`✓ User: ${user.email}`);

        console.log('\n✅ All passwords reset!\n');
        console.log('📝 Test Credentials:');
        console.log('   ADMIN:');
        console.log('     Email: admin@5r-associates.com');
        console.log('     Password: admin123');
        console.log('\n   USER:');
        console.log('     Email: platformwithnb@gmail.com');
        console.log('     Password: user123\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetAllPasswords();
