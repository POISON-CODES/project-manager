import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'aman.keswani@quicksell.co';
    const user = await prisma.user.update({
        where: { email },
        data: { role: UserRole.ADMIN }
    });
    console.log(`✅ User ${email} promoted to ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
