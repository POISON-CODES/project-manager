
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const counts = await prisma.formTemplate.count();
        console.log('Form templates count:', counts);
        const forms = await prisma.formTemplate.findMany({ take: 5 });
        console.log('Top 5 forms:', JSON.stringify(forms, null, 2));
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
