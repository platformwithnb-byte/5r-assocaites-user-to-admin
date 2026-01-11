import { PrismaClient } from '@prisma/client';
import { services } from '../backend/config/services.js';

const prisma = new PrismaClient();

async function seedServices() {
    console.log('🌱 Seeding services...');

    try {
        // Check if services already exist
        const existingServices = await prisma.service.findMany();

        if (existingServices.length > 0) {
            console.log(`✓ Services already exist (${existingServices.length} found). Skipping seed.`);
            return;
        }

        // Insert predefined services
        for (const service of services) {
            await prisma.service.create({
                data: {
                    code: service.code,
                    name: service.name,
                    description: service.description,
                },
            });
            console.log(`  ✓ Added: ${service.name} (${service.code})`);
        }

        console.log(`✓ Successfully seeded ${services.length} services`);
    } catch (error) {
        console.error('✗ Error seeding services:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run seed
seedServices()
    .then(() => {
        console.log('\n🎉 Database seed completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    });
