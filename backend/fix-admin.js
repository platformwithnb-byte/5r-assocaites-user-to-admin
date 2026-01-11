import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        console.log('\n🔐 Resetting admin password...\n');

        // Hash new password
        const hashedPassword = await bcryptjs.hash('admin123', 10);

        // Update admin user
        const admin = await prisma.user.update({
            where: { email: 'veeramanojaohmb@gmail.com' },
            data: { password: hashedPassword },
        });

        console.log(`✅ Admin password reset!\n`);
        console.log('📝 Credentials:');
        console.log(`   Email: ${admin.email}`);
        console.log('   Password: admin123\n');

    } catch (error) {
        console.error('❌ Error:', error.message);

        // If user doesn't exist, create it
        if (error.code === 'P2025') {
            console.log('\nUser not found. Creating admin user...\n');
            const hashedPassword = await bcryptjs.hash('admin123', 10);
            const newAdmin = await prisma.user.create({
                data: {
                    email: 'veeramanojaohmb@gmail.com',
                    password: hashedPassword,
                    name: 'Admin',
                    phone: '9876543210',
                    role: 'ADMIN',
                },
            });
            console.log(`✅ Admin created!\n`);
            console.log('📝 Credentials:');
            console.log(`   Email: ${newAdmin.email}`);
            console.log('   Password: admin123\n');
        }
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
