import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log('\n📋 Users in Database:\n');
        console.log('='.repeat(80));

        if (users.length === 0) {
            console.log('No users found. Sign up to create your first account.');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Phone: ${user.phone || 'N/A'}`);
                console.log(`   Created: ${user.createdAt.toLocaleString()}`);
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\nTotal users: ${users.length}`);
        console.log(`Users: ${users.filter(u => u.role === 'USER').length} | Admins: ${users.filter(u => u.role === 'ADMIN').length}\n`);

    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
