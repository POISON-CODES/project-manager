import { PrismaClient, UserRole, UserStatus, ProjectStatus, TaskStatus, Priority } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Supabase Admin client (requires Service Role Key)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

async function createSeededUser(params: {
    email: string;
    name: string;
    role: UserRole;
    avatarUrl: string;
    phoneNumber: string;
}) {
    let userId = uuidv4();

    if (supabase) {
        console.log(`📡 Creating ${params.email} in Supabase Auth...`);
        const { data, error } = await supabase.auth.admin.createUser({
            email: params.email,
            password: 'password', // Default password for all seed users
            email_confirm: true,
            user_metadata: {
                name: params.name,
                role: params.role
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log(`ℹ️ User ${params.email} already exists in Supabase. Attempting to match IDs...`);
                // Try to find the user to get their ID
                const { data: listData } = (await supabase.auth.admin.listUsers()) as any;
                const existingUser = (listData?.users || []).find((u: any) => u.email === params.email);
                if (existingUser) userId = existingUser.id;
            } else {
                console.warn(`⚠️ Error creating user in Supabase: ${error.message}`);
            }
        } else if (data.user) {
            userId = data.user.id;
            console.log(`✅ ${params.email} created in Supabase with ID: ${userId}`);
        }
    } else {
        console.warn(`⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Creating ${params.email} with local UUID. (Login won't work)`);
    }

    return await prisma.user.upsert({
        where: { email: params.email },
        update: {
            id: userId, // Align ID with Supabase if possible
            role: params.role,
            status: UserStatus.APPROVED,
        },
        create: {
            id: userId,
            email: params.email,
            name: params.name,
            phoneNumber: params.phoneNumber,
            role: params.role,
            status: UserStatus.APPROVED,
            avatarUrl: params.avatarUrl,
        },
    });
}

async function main() {
    console.log('🌱 Starting seed...');

    // 2. Create Users
    const admin = await createSeededUser({
        email: 'admin@nexa.com',
        name: 'Admin User',
        phoneNumber: '1234567890',
        role: UserRole.ADMIN,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    });

    const lead = await createSeededUser({
        email: 'lead@nexa.com',
        name: 'Project Lead',
        phoneNumber: '1234567891',
        role: UserRole.PROJECT_LEAD,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lead',
    });

    const member = await createSeededUser({
        email: 'member@nexa.com',
        name: 'Team Member',
        phoneNumber: '1234567892',
        role: UserRole.MEMBER,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member',
    });

    const stakeholder = await createSeededUser({
        email: 'stakeholder@clients.com',
        name: 'Client Stakeholder',
        phoneNumber: '1234567893',
        role: UserRole.STAKEHOLDER,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stakeholder',
    });

    console.log('✅ Users seeded');

    // 3. Create Form Template
    const formTemplate = await prisma.formTemplate.create({
        data: {
            name: 'Standard Project Intake',
            description: 'Default intake form for new client projects',
            schema: {
                type: 'object',
                properties: {
                    clientName: { type: 'string', title: 'Client Name' },
                    budget: { type: 'number', title: 'Budget (USD)' },
                    deadline: { type: 'string', format: 'date', title: 'Requested Deadline' },
                },
                required: ['clientName', 'budget'],
            },
            isActive: true,
        },
    });

    console.log('✅ Form Template seeded');

    // 4. Create Project
    const project = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Complete overhaul of the corporate website.',
            status: ProjectStatus.ACTIVE,
            ownerId: lead.id,
            stakeholderId: stakeholder.id,
            formTemplateId: formTemplate.id,
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-08-31'),
            formData: {
                clientName: 'Acme Corp',
                budget: 50000,
                deadline: '2024-12-31',
            },
        },
    });

    console.log('✅ Project seeded');

    // 5. Create User Stories
    const story1 = await prisma.userStory.create({
        data: {
            title: 'Setup & Infrastructure',
            description: 'Initialize repo, CI/CD, and basic hosting.',
            status: 'IN_PROGRESS',
            projectId: project.id,
        },
    });

    const story2 = await prisma.userStory.create({
        data: {
            title: 'Homepage Design',
            description: 'Design and implement the new homepage.',
            status: 'READY',
            projectId: project.id,
        },
    });

    console.log('✅ User Stories seeded');

    // 6. Create Tasks
    const task1 = await prisma.task.create({
        data: {
            title: 'Configure CI/CD Pipeline',
            description: 'Set up GitHub Actions for automated testing and deployment.',
            status: TaskStatus.DONE,
            priority: Priority.HIGH,
            storyId: story1.id,
            assigneeId: member.id,
        },
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Setup Staging Environment',
            description: 'Provision cloud resources for staging.',
            status: TaskStatus.IN_PROGRESS,
            priority: Priority.MEDIUM,
            storyId: story1.id,
            assigneeId: member.id,
        },
    });

    const task3 = await prisma.task.create({
        data: {
            title: 'Draft Homepage Wireframes',
            status: TaskStatus.TODO,
            priority: Priority.MEDIUM,
            storyId: story2.id,
            assigneeId: lead.id, // Lead taking a design task
        },
    });

    // 7. Blocks / Dependencies
    // Task 2 depends on Task 1
    await prisma.task.update({
        where: { id: task2.id },
        data: {
            blockedBy: { connect: { id: task1.id } },
        },
    });

    console.log('✅ Tasks & Dependencies seeded');

    // 8. Comments
    await prisma.comment.create({
        data: {
            content: 'CI/CD pipeline is ready. Check the docs.',
            taskId: task1.id,
            authorId: member.id,
        },
    });

    await prisma.comment.create({
        data: {
            content: 'Great work! Proceeding with staging setup.',
            taskId: task1.id, // Comment on completed task
            authorId: lead.id,
        },
    });

    console.log('✅ Comments seeded');

    // 9. Workflows (Demo)
    await prisma.workflow.create({
        data: {
            name: 'Notify Stakeholder on Completion',
            triggerType: 'PROJECT_COMPLETED',
            description: 'Sends an email to the stakeholder when a project is marked done.',
            actions: {
                create: [
                    {
                        order: 1,
                        type: 'EMAIL',
                        config: {
                            to: '{{project.stakeholder.email}}',
                            subject: 'Project {{project.name}} Completed',
                            body: 'Your project has been successfully delivered.',
                        },
                    },
                ],
            },
        },
    });

    console.log('✅ Workflow seeded');
    console.log('🌱 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
