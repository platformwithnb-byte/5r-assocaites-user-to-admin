import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function debugAndFix() {
    try {
        console.log('\n=== DATABASE USER DEBUG ===\n');

        // Show all users
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });

        console.log('📋 Current Users:');
        allUsers.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email} - ${u.name} (${u.role})`);
        });

        console.log('\n🔄 Resetting Admin Password...');

        // Find or create admin
        let admin = allUsers.find(u => u.role === 'ADMIN');

        if (!admin) {
            console.log('   No ADMIN found, creating new one...');
            const hashedPassword = await bcryptjs.hash('admin123', 10);
            admin = await prisma.user.create({
                data: {
                    email: 'admin@example.com',
                    password: hashedPassword,
                    name: 'Admin',
                    phone: '9999999999',
                    role: 'ADMIN',
                },
            });
        } else {
            console.log(`   Updating password for: ${admin.email}`);
            const hashedPassword = await bcryptjs.hash('admin123', 10);
            await prisma.user.update({
                where: { id: admin.id },
                data: { password: hashedPassword },
            });
        }

        // Reset user password
        let user = allUsers.find(u => u.role === 'USER' && u.email === 'platformwithnb@gmail.com');
        if (user) {
            console.log(`\n🔄 Resetting User Password for: ${user.email}`);
            const hashedPassword = await bcryptjs.hash('user123', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
        }

        console.log('\n✅ PASSWORD RESET COMPLETE!\n');
        console.log('=== TEST CREDENTIALS ===\n');
        console.log('ADMIN:');
        console.log(`  Email: ${admin.email}`);
        console.log('  Password: admin123\n');

        if (user) {
            console.log('USER:');
            console.log(`  Email: ${user.email}`);
            console.log('  Password: user123\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAndFix();
