import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProgressSystem() {
    try {
        console.log('\n🔍 Testing Progress System...\n');

        // Find a request in PAYMENT or IN_PROGRESS status
        const requests = await prisma.serviceRequest.findMany({
            where: {
                OR: [
                    { status: 'PAYMENT' },
                    { status: 'IN_PROGRESS' }
                ]
            },
            include: {
                service: true,
                user: true
            }
        });

        console.log(`📋 Found ${requests.length} eligible requests for progress tracking:`);
        requests.forEach(req => {
            console.log(`   - ${req.requestCode}: ${req.service.name} (${req.status})`);
            console.log(`     User: ${req.user.email}`);
        });

        // Check existing progress
        const progress = await prisma.workProgress.findMany({
            include: {
                request: {
                    include: {
                        service: true
                    }
                },
                user: true
            }
        });

        console.log(`\n📊 Existing progress updates: ${progress.length}`);
        if (progress.length > 0) {
            progress.forEach(p => {
                console.log(`   - Request: ${p.request.requestCode}`);
                console.log(`     Title: ${p.title}`);
                console.log(`     Description: ${p.description || 'N/A'}`);
                console.log(`     Photos: ${p.photos.length}`);
                console.log(`     Videos: ${p.videos.length}`);
                console.log(`     Completion: ${p.completionPercent}%`);
                console.log(`     Created: ${p.createdAt}`);
            });
        } else {
            console.log('   No progress updates yet');
        }

        console.log('\n✅ Progress system database check completed');

    } catch (error) {
        console.error('❌ Error testing progress system:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testProgressSystem();
