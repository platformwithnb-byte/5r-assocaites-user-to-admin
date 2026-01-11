import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listRequests() {
    try {
        const requests = await prisma.serviceRequest.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                service: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log('\n📋 Service Requests:\n');
        console.log('='.repeat(100));

        if (requests.length === 0) {
            console.log('No service requests found.');
        } else {
            requests.forEach((req, idx) => {
                console.log(`\n${idx + 1}. ${req.requestCode}`);
                console.log(`   Service: ${req.service?.name || 'N/A'} (${req.service?.code || 'N/A'})`);
                console.log(`   Request ID: ${req.id}`);
                console.log(`   Status: ${req.status}`);
                console.log(`   User: ${req.user?.name || 'N/A'} (${req.user?.email || 'N/A'}) [${req.user?.role || 'N/A'}]`);
                console.log(`   Location: ${req.location || 'N/A'}`);
                console.log(`   Description: ${req.description || 'N/A'}`);
                console.log(`   Preferred Date: ${req.preferredDate ? req.preferredDate.toISOString().split('T')[0] : 'N/A'}`);
                console.log(`   Created: ${req.createdAt.toLocaleString()}`);
                console.log(`   Updated: ${req.updatedAt.toLocaleString()}`);
            });
        }

        console.log('\n' + '='.repeat(100));
        console.log(`\nTotal requests: ${requests.length}\n`);
    } catch (error) {
        console.error('Error fetching requests:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listRequests();
