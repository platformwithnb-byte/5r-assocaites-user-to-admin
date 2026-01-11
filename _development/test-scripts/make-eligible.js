import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeRequestEligible() {
    try {
        console.log('\n🔧 Making requests eligible for Work Progress...\n');

        // Get all user requests
        const requests = await prisma.serviceRequest.findMany({
            include: {
                user: true,
                service: true,
            }
        });

        console.log(`📋 Found ${requests.length} requests:\n`);

        if (requests.length === 0) {
            console.log('❌ No requests found!');
            return;
        }

        requests.forEach(req => {
            console.log(`   ID: ${req.id}`);
            console.log(`   Code: ${req.requestCode}`);
            console.log(`   User: ${req.user.email}`);
            console.log(`   Service: ${req.service.name}`);
            console.log(`   Current Status: ${req.status}`);
            console.log('   ---');
        });

        // Update first request to PAYMENT status
        const requestToUpdate = requests[0];
        const updated = await prisma.serviceRequest.update({
            where: { id: requestToUpdate.id },
            data: { status: 'PAYMENT' },
            include: {
                user: true,
                service: true,
            }
        });

        console.log('\n✅ Request Updated to PAYMENT status!\n');
        console.log(`   Code: ${updated.requestCode}`);
        console.log(`   Service: ${updated.service.name}`);
        console.log(`   User: ${updated.user.email}`);
        console.log(`   NEW Status: ${updated.status}`);
        console.log('\n   ✨ This request is now eligible for work progress uploads!');
        console.log('\n   Next steps:');
        console.log('   1. Admin: Go to "Work Progress" → "Upload Progress"');
        console.log('   2. Admin: Select this project from dropdown');
        console.log('   3. Admin: Fill title, description, completion %');
        console.log('   4. Admin: Upload photos/videos (optional)');
        console.log('   5. Admin: Click "Upload Progress Update"');
        console.log('   6. Status will automatically change to IN_PROGRESS');
        console.log('   7. User can then view progress in their dashboard\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

makeRequestEligible();
