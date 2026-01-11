import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPasswords() {
    try {
        console.log('\n🔑 Resetting User Passwords...\n');

        // Hash new passwords
        const userPassword = await bcryptjs.hash('user123456', 10);
        const adminPassword = await bcryptjs.hash('admin123456', 10);

        // Update existing users
        const userUpdate = await prisma.user.updateMany({
            where: { email: 'platformwithnb@gmail.com' },
            data: { password: userPassword }
        });

        console.log(`✅ Updated USER password (platformwithnb@gmail.com)`);
        console.log(`   New password: user123456`);

        const adminUpdate = await prisma.user.updateMany({
            where: { email: 'veeramanojaohmb@gmail.com' },
            data: { password: adminPassword }
        });

        console.log(`✅ Updated ADMIN password (veeramanojaohmb@gmail.com)`);
        console.log(`   New password: admin123456`);

        // Display all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });

        console.log('\n📋 Current Users:\n');
        users.forEach(u => {
            console.log(`   Email: ${u.email}`);
            console.log(`   Name: ${u.name}`);
            console.log(`   Role: ${u.role}`);
            console.log(`   ---`);
        });

        console.log('\n✅ Password reset complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetPasswords();
