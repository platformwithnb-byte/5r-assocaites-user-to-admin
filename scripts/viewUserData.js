import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Detailed user data viewer
 * Shows all user and admin information
 */
async function viewUserData() {
    try {
        console.log('\n🔓 USER & ADMIN DATABASE - COMPLETE DATA\n');
        console.log('='.repeat(100));

        // Get all users
        const users = await prisma.user.findMany({
            include: {
                requests: {
                    select: {
                        id: true,
                        requestCode: true,
                        status: true,
                    },
                },
                quotations: {
                    select: {
                        id: true,
                        quotationNumber: true,
                        status: true,
                    },
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                    },
                },
            },
            orderBy: [
                { role: 'desc' }, // ADMIN first
                { createdAt: 'desc' },
            ],
        });

        if (users.length === 0) {
            console.log('No users found in database.\n');
            return;
        }

        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.role === 'ADMIN' ? '👤 ADMIN' : '👥 USER'} - ${user.name}`);
            console.log('-'.repeat(100));
            console.log(`  ID:          ${user.id}`);
            console.log(`  Email:       ${user.email}`);
            console.log(`  Phone:       ${user.phone || 'Not provided'}`);
            console.log(`  Address:     ${user.address || 'Not provided'}`);
            console.log(`  Role:        ${user.role}`);
            console.log(`  Created:     ${new Date(user.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
            console.log(`  Updated:     ${new Date(user.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
            console.log(`  \n  📊 Activity:`);
            console.log(`    • Service Requests:  ${user.requests.length}`);
            console.log(`    • Quotations:        ${user.quotations.length}`);
            console.log(`    • Payments:          ${user.payments.length}`);

            if (user.requests.length > 0) {
                console.log(`    \n    Requests:`);
                user.requests.forEach(req => {
                    console.log(`      - ${req.requestCode} (${req.status})`);
                });
            }
        });

        console.log('\n' + '='.repeat(100));
        console.log(`\n📈 SUMMARY:`);
        console.log(`  Total Users:  ${users.length}`);
        console.log(`  Admins:       ${users.filter(u => u.role === 'ADMIN').length}`);
        console.log(`  Regular Users: ${users.filter(u => u.role === 'USER').length}`);
        console.log(`  Total Requests: ${users.reduce((sum, u) => sum + u.requests.length, 0)}`);
        console.log(`  Total Quotations: ${users.reduce((sum, u) => sum + u.quotations.length, 0)}`);
        console.log(`  Total Payments: ${users.reduce((sum, u) => sum + u.payments.length, 0)}\n`);

    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run viewer
viewUserData();
