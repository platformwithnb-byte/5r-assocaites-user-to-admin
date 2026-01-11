import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
    const quotations = await prisma.quotation.findMany({
        include: {
            request: true,
            user: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    console.log('\n📄 Quotations:\n');
    if (!quotations.length) {
        console.log('No quotations found');
        return;
    }

    quotations.forEach((q, idx) => {
        console.log(`#${idx + 1} ${q.quotationNumber} | status=${q.status}`);
        console.log(`  requestId: ${q.requestId}`);
        console.log(`  user: ${q.user?.email}`);
        console.log(`  total: ${q.totalAmount}`);
        console.log(`  created: ${q.createdAt}`);
        console.log('');
    });
};

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
