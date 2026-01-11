import 'dotenv/config.js';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
    try {
        console.log('\n🌱 Seeding database with test data...\n');

        // Create users
        const hashedUserPassword = await bcryptjs.hash('user123456', 10);
        const hashedAdminPassword = await bcryptjs.hash('admin123456', 10);

        const user = await prisma.user.create({
            data: {
                email: 'platformwithnb@gmail.com',
                password: hashedUserPassword,
                name: 'Test User',
                phone: '9876543210',
                role: 'USER',
            },
        });

        const admin = await prisma.user.create({
            data: {
                email: 'veeramanojaohmb@gmail.com',
                password: hashedAdminPassword,
                name: 'Admin User',
                phone: '9123456789',
                role: 'ADMIN',
            },
        });

        console.log('✅ Users created:');
        console.log(`   - ${user.email} (USER)`);
        console.log(`   - ${admin.email} (ADMIN)`);

        // Create service
        const service = await prisma.service.create({
            data: {
                code: 'CONST001',
                name: 'Construction',
                description: 'Construction and building services',
                basePrice: 500000,
            },
        });

        console.log('✅ Service created: Construction');

        // Create service request
        const request = await prisma.serviceRequest.create({
            data: {
                requestCode: 'SVC-20260106-0001',
                userId: user.id,
                serviceId: service.id,
                status: 'QUOTED',
                description: 'Construction of 3BHK house',
                location: 'Mysuru',
                preferredDate: new Date('2026-01-20'),
            },
        });

        console.log(`✅ Service Request created: ${request.requestCode}`);

        // Create quotation
        const quotation = await prisma.quotation.create({
            data: {
                quotationNumber: 'QT-20260106-001',
                requestId: request.id,
                userId: user.id,
                baseAmount: 500000,
                serviceTax: 0,
                gstRate: 18,
                gstAmount: 90000,
                totalAmount: 590000,
                description: 'Complete construction with modern design',
                status: 'APPROVED',
            },
        });

        console.log(`✅ Quotation created: ${quotation.quotationNumber} (APPROVED)`);

        // Update request to PAYMENT status
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id: request.id },
            data: { status: 'PAYMENT', paymentStatus: 'PENDING' },
        });

        console.log(`✅ Request status updated to: ${updatedRequest.status}`);

        // Create a payment record
        const payment = await prisma.payment.create({
            data: {
                requestId: request.id,
                userId: user.id,
                amount: 590000,
                type: 'FULL',
                status: 'PENDING',
                description: 'Full project payment',
            },
        });

        console.log(`✅ Payment record created (status: PENDING)`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Credentials:');
        console.log('   USER:  platformwithnb@gmail.com / user123456');
        console.log('   ADMIN: veeramanojaohmb@gmail.com / admin123456');
        console.log('\nTest Project:');
        console.log(`   Code: ${request.requestCode}`);
        console.log(`   Status: ${updatedRequest.status} (Ready for progress upload)`);
        console.log(`   Quotation: ${quotation.quotationNumber}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedDatabase();
