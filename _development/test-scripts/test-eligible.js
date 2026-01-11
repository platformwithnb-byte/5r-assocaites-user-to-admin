import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEligible() {
    try {
        // Check for PAYMENT status requests
        const paymentRequests = await prisma.serviceRequest.findMany({
            where: { status: 'PAYMENT' },
            include: { service: true, user: true }
        });

        if (paymentRequests.length > 0) {
            console.log('\n✓ PAYMENT Status Requests (Eligible for testing):');
            paymentRequests.forEach(req => {
                console.log(`  - ${req.requestCode} | ${req.service.name} | ${req.user.email}`);
            });
        } else {
            console.log('\n✗ No PAYMENT status requests found');
            console.log('Creating test request...');

            // Get first user and service for test
            const user = await prisma.user.findFirst();
            const service = await prisma.serviceCategory.findFirst();

            if (user && service) {
                const testReq = await prisma.serviceRequest.create({
                    data: {
                        requestCode: `TEST-${Date.now()}`,
                        userId: user.id,
                        serviceId: service.id,
                        status: 'PAYMENT',
                        description: 'Test request for progress testing'
                    },
                    include: { service: true, user: true }
                });
                console.log(`  ✓ Created: ${testReq.requestCode}`);
            }
        }

        // Check IN_PROGRESS requests
        const inProgressRequests = await prisma.serviceRequest.findMany({
            where: { status: 'IN_PROGRESS' },
            include: { service: true, user: true }
        });

        if (inProgressRequests.length > 0) {
            console.log('\n✓ IN_PROGRESS Status Requests:');
            inProgressRequests.forEach(req => {
                console.log(`  - ${req.requestCode} | ${req.service.name} | ${req.user.email}`);
            });
        }

        console.log('\n✓ TEST MODE is ENABLED in progressController.js');
        console.log('  - PAYMENT status requests can upload progress');
        console.log('  - No Razorpay verification required');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testEligible();
