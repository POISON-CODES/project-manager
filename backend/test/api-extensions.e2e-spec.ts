import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { UserRole, TaskStatus } from '@prisma/client';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

jest.setTimeout(30000);

describe('API Extensions (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let testUser: any;
    let testProject: any;
    let testStory: any;
    let testTask: any;

    const mockUserId = `test-user-${Date.now()}`;
    const mockUser = {
        id: mockUserId,
        email: `admin-${Date.now()}@example.com`,
        role: UserRole.ADMIN,
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = mockUser;
                    return true;
                },
            })
            .overrideGuard(RolesGuard)
            .useValue({
                canActivate: () => true,
            })
            .compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Ensure clean state for this specific user ID
        await prisma.user.delete({ where: { id: mockUserId } }).catch(() => { });

        // Setup: Create a test user, project, story, and task
        testUser = await prisma.user.create({
            data: {
                id: mockUserId,
                email: mockUser.email,
                name: 'Test Ext User',
                phoneNumber: `1234-${Date.now()}`,
                role: UserRole.ADMIN,
            },
        });

        const formTemplate = await prisma.formTemplate.create({
            data: {
                name: 'Test Template',
                schema: {},
            },
        });

        testProject = await prisma.project.create({
            data: {
                name: 'Test Ext Project',
                formTemplateId: formTemplate.id,
                formData: {},
                ownerId: testUser.id,
            },
        });

        testStory = await prisma.userStory.create({
            data: {
                title: 'Test Ext Story',
                projectId: testProject.id,
            },
        });

        testTask = await prisma.task.create({
            data: {
                title: 'Test Ext Task',
                storyId: testStory.id,
                assigneeId: testUser.id,
                status: TaskStatus.IN_PROGRESS,
            },
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.comment.deleteMany({ where: { taskId: { in: [testTask?.id].filter(Boolean) } } });
        await prisma.task.deleteMany({ where: { storyId: testStory?.id } });
        await prisma.userStory.deleteMany({ where: { projectId: testProject?.id } });
        await prisma.project.deleteMany({ where: { id: testProject?.id } });
        await prisma.user.delete({ where: { id: mockUserId } }).catch(() => { });
        await app.close();
    });

    it('/users (GET) - should return list of users', async () => {
        const response = await request(app.getHttpServer())
            .get('/users')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.some((u: any) => u.id === testUser.id)).toBe(true);
    });

    it('/projects/timeline (GET) - should return hierarchy', async () => {
        const response = await request(app.getHttpServer())
            .get('/projects/timeline')
            .expect(200);

        expect(response.body.success).toBe(true);
        const project = response.body.data.find((p: any) => p.id === testProject.id);
        expect(project).toBeDefined();
        expect(project.stories.length).toBeGreaterThan(0);
    });

    it('/tasks (GET) - should support filtering', async () => {
        // Filter by status
        const statusRes = await request(app.getHttpServer())
            .get(`/tasks?status=${TaskStatus.IN_PROGRESS}`)
            .expect(200);
        expect(statusRes.body.data.some((t: any) => t.id === testTask.id)).toBe(true);
        expect(statusRes.body.data.every((t: any) => t.status === TaskStatus.IN_PROGRESS)).toBe(true);

        // Filter by user
        const userRes = await request(app.getHttpServer())
            .get(`/tasks?userIds=${testUser.id}`)
            .expect(200);
        expect(userRes.body.data.some((t: any) => t.id === testTask.id)).toBe(true);
    });

    it('/tasks/:id/comments (POST/GET) - should handle comments', async () => {
        // Post comment
        const postRes = await request(app.getHttpServer())
            .post(`/tasks/${testTask.id}/comments`)
            .send({ content: 'Test Comment' })
            .expect(201);
        expect(postRes.body.success).toBe(true);
        expect(postRes.body.data.content).toBe('Test Comment');

        // Get comments
        const getRes = await request(app.getHttpServer())
            .get(`/tasks/${testTask.id}/comments`)
            .expect(200);
        expect(getRes.body.data.length).toBeGreaterThan(0);
        expect(getRes.body.data[0].content).toBe('Test Comment');
    });

    it('/admin/stages (GET) - should return stages', async () => {
        const response = await request(app.getHttpServer())
            .get('/admin/stages')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(5);
        expect(response.body.data[0]).toHaveProperty('label');
    });
});
