import { PrismaClient, UserRole, UserStatus, TaskStatus, Priority, StoryStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Optional: Supabase client for cleaning up auth users if needed
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean up existing data (in reverse order of dependencies)
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.userStory.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.project.deleteMany();
    await prisma.projectStage.deleteMany();
    await prisma.formTemplate.deleteMany();
    await prisma.userActivity.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleaned up existing data');

    // 2. Create Users
    const users = [
        {
            email: 'admin@nexa.com',
            name: 'Alex Rivera',
            role: UserRole.ADMIN,
            phoneNumber: '1234567890',
            status: UserStatus.APPROVED,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
        {
            email: 'lead@nexa.com',
            name: 'Sarah Chen',
            role: UserRole.PROJECT_LEAD,
            phoneNumber: '1234567891',
            status: UserStatus.APPROVED,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
        {
            email: 'stakeholder@clients.com',
            name: 'Marcus Thorne',
            role: UserRole.STAKEHOLDER,
            phoneNumber: '1234567892',
            status: UserStatus.APPROVED,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        },
        {
            email: 'dev1@nexa.com',
            name: 'Jordan Smith',
            role: UserRole.MEMBER,
            phoneNumber: '1234567893',
            status: UserStatus.APPROVED,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        }
    ];

    const seededUsers = [];
    for (const u of users) {
        const user = await prisma.user.create({ data: u });
        seededUsers.push(user);
    }

    console.log('✅ Users seeded');

    const admin = seededUsers[0];
    const lead = seededUsers[1];
    const stakeholder = seededUsers[2];
    const dev = seededUsers[3];

    // 3. Create Form Template
    const formTemplate = await prisma.formTemplate.create({
        data: {
            title: 'Technical Infrastructure Intake',
            description: 'Standard protocol for requesting new technical infrastructure or system modifications.',
            version: '1.0.0',
            isActive: true,
            schema: {
                sections: [
                    {
                        title: 'General Information',
                        fields: [
                            { name: 'projectName', label: 'Project Name', type: 'text', required: true },
                            { name: 'priority', label: 'Requested Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] }
                        ]
                    },
                    {
                        title: 'Technical Scope',
                        fields: [
                            { name: 'budget', label: 'Estimated Budget ($)', type: 'number' },
                            { name: 'description', label: 'Detailed Description', type: 'textarea' }
                        ]
                    }
                ]
            }
        } as any
    });

    await prisma.formTemplate.create({
        data: {
            id: 'generic-intake-form',
            title: 'Generic Project Intake',
            description: 'Strategic intake protocol for cross-departmental initiatives.',
            version: '1.0.0',
            isActive: true,
            schema: {}
        } as any
    });

    console.log('✅ Form Templates seeded');

    // 3.5 Create Project Stages
    const stagesData = [
        { name: 'Project Submitted', color: 'blue', order: 0, description: 'Default status for new form submissions.', icon: 'Clock' },
        { name: 'Feasibility Accepted', color: 'emerald', order: 1, description: 'Project has cleared technical and business viability checks.', icon: 'CheckCircle2' },
        { name: 'Feasibility Rejected', color: 'rose', order: 2, description: 'Project does not meet requirement criteria.', icon: 'AlertCircle' },
        { name: 'In Queue', color: 'orange', order: 3, description: 'Scheduled for developmental kickoff.', icon: 'Layers' },
        { name: 'Triage ongoing', color: 'indigo', order: 4, description: 'Mission-critical triage and requirement mapping in progress.', icon: 'Activity' },
        { name: 'Ongoing', color: 'blue', order: 5, description: 'Active development phase.', icon: 'PlayCircle' },
        { name: 'Halted for Stakeholder', color: 'amber', order: 6, description: 'Awaiting stakeholder input/approval.', icon: 'PauseCircle' },
        { name: 'Halted for Tech', color: 'amber', order: 7, description: 'Blocked by technical constraints or debt.', icon: 'PauseCircle' },
        { name: 'Completed, UAT Ongoing', color: 'emerald', order: 8, description: 'Built and undergoing user acceptance testing.', icon: 'History' },
        { name: 'Input Changes Ongoing', color: 'indigo', order: 9, description: 'Refining features based on feedback.', icon: 'Edit3' },
        { name: 'Handover Complete', color: 'green', order: 10, description: 'Final delivery confirmed.', icon: 'ShieldCheck' },
        { name: 'Cancelled', color: 'slate', order: 11, description: 'Project terminated.', icon: 'Trash2' },
    ];

    const stages = [];
    for (const stageData of stagesData) {
        const stage = await prisma.projectStage.create({ data: stageData });
        stages.push(stage);
    }

    console.log('✅ Project Stages seeded');

    // 4. Create Project
    const project = await prisma.project.create({
        data: {
            name: 'Project Phoenix: Infrastructure Modernization',
            description: 'Migration of legacy microservices to a serverless architectural protocol with automated CI/CD pipelines.',
            ownerId: lead.id,
            stakeholderId: stakeholder.id,
            formTemplateId: formTemplate.id,
            currentStageId: stages[0].id,
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-08-31'),
            formData: {
                projectName: 'Project Phoenix',
                priority: 'High',
                budget: 50000,
                description: 'Full migration to Cloud Native architecture.',
            }
        }
    });

    console.log('✅ Project seeded');

    // 5. Create User Stories
    const stories = [
        {
            title: 'Cloud Environment Setup',
            description: 'Configure VPCs, Subnets, and IAM protocols for the new production cluster.',
            projectId: project.id,
            status: StoryStatus.IN_PROGRESS,
        },
        {
            title: 'Data Migration Strategy',
            description: 'Architecting zero-downtime migration protocol for the core customer database.',
            projectId: project.id,
            status: StoryStatus.BACKLOG,
        }
    ];

    const seededStories = [];
    for (const s of stories) {
        const story = await prisma.userStory.create({ data: s });
        seededStories.push(story);
    }

    console.log('✅ User Stories seeded');

    // 6. Create Tasks
    const task1 = await prisma.task.create({
        data: {
            title: 'Terraform Scripts: Networking',
            description: 'Define VPC and Security Group protocols using HCL.',
            status: TaskStatus.IN_PROGRESS,
            priority: Priority.HIGH,
            assigneeId: dev.id,
            storyId: seededStories[0].id,
            dueDate: new Date('2024-04-15'),
            estimatedMinutes: 12 * 60,
        }
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Security Audit: Networking',
            description: 'Peer review of the network architecture for compliance with SOC2 protocol.',
            status: TaskStatus.TODO,
            priority: Priority.CRITICAL,
            assigneeId: admin.id,
            storyId: seededStories[0].id,
            dueDate: new Date('2024-04-20'),
            estimatedMinutes: 4 * 60,
        }
    });

    console.log('✅ Tasks & Dependencies seeded');

    // 7. Add Comments
    await prisma.comment.create({
        data: {
            content: 'Network architecture must include redundant VPN gateways as per the new stakeholder requirement.',
            authorId: stakeholder.id,
            taskId: task1.id,
        }
    });

    await prisma.comment.create({
        data: {
            content: 'Agreed. Will integrate into the Terraform manifests by EOD.',
            authorId: dev.id,
            taskId: task1.id,
        }
    });

    console.log('✅ Comments seeded');

    // 8. Create Workflow
    await prisma.workflow.create({
        data: {
            name: 'Deployment Protocol',
            description: 'Automated workflow for staging to production promotion.',
            isActive: true,
            triggerType: 'MANUAL',
            triggerConfig: {
                triggers: ['test_passed', 'lead_approved'],
                actions: ['deploy_to_k8s', 'notify_slack']
            }
        }
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
