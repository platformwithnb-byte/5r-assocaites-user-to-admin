import 'dotenv/config.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, email: true, name: true } });
    console.log('Admin user:', admin);
};

main()
    .catch((err) => console.error('Error finding admin:', err))
    .finally(() => prisma.$disconnect());
