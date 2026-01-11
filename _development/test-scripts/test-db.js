import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDB() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testDB();
