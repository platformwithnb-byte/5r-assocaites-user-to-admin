import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function resetUserPassword() {
    try {
        console.log('\n🔄 Resetting user password...\n');

        const newPassword = 'user123';
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email: 'platformwithnb@gmail.com' },
            data: { password: hashedPassword },
        });

        console.log(`✅ Password updated for: ${user.email}`);
        console.log(`\n📝 Login Credentials:`);
        console.log(`   Email: platformwithnb@gmail.com`);
        console.log(`   Password: user123\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetUserPassword();
