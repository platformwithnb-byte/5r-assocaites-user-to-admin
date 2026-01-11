import 'dotenv/config.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
    const requests = await prisma.serviceRequest.findMany({
        where: { status: { in: ['PAYMENT', 'IN_PROGRESS'] } },
        include: { service: true, user: true },
        orderBy: { createdAt: 'desc' },
    });

    if (!requests.length) {
        console.log('No PAYMENT or IN_PROGRESS requests found.');
        return;
    }

    console.log('Eligible requests:');
    for (const r of requests) {
        console.log(`- ${r.requestCode} | ${r.status} | ${r.service?.name ?? 'n/a'} | ${r.user?.email ?? 'n/a'} | id=${r.id}`);
    }
};

main()
    .catch((err) => {
        console.error('Error listing eligible requests:', err);
    })
    .finally(() => prisma.$disconnect());
