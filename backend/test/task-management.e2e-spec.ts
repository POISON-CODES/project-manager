import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('Task Management (E2E)', () => {
  let app: INestApplication;
  let projectId: string;
  let storyId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'mock-user-id', role: 'ADMIN' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Cleanup
    const prisma = app.get(PrismaService);
    if (projectId) {
      await prisma.userStory.deleteMany({ where: { projectId } });
      await prisma.project.delete({ where: { id: projectId } });
    }
    await app.close();
  });

  it('/forms (POST) - Create Form Template', async () => {
    const res = await request(app.getHttpServer())
      .post('/forms')
      .send({
        title: 'Task Mgmt Test Form',
        schema: { type: 'object', properties: {} },
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    return res.body.data.id;
  });

  it('/projects (POST) - Create Project', async () => {
    // First get a form ID
    const formRes = await request(app.getHttpServer())
      .post('/forms')
      .send({ title: 'Task Mgmt Project Form', schema: {} });

    const formId = formRes.body.data.id;

    const res = await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: 'Task Mgmt Project',
        description: 'Testing tasks',
        formTemplateId: formId,
        formData: {},
      })
      .expect(201);

    projectId = res.body.data.id;
    expect(projectId).toBeDefined();
  });

  it('/projects/:id/stories (POST) - Create Story', async () => {
    const res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/stories`)
      .send({
        title: 'User Story A',
        description: 'As a user...',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    storyId = res.body.data.id;
    expect(storyId).toBeDefined();
    expect(res.body.data.projectId).toBe(projectId);
  });

  it('/stories/:id/tasks (POST) - Create Task', async () => {
    const res = await request(app.getHttpServer())
      .post(`/stories/${storyId}/tasks`)
      .send({
        title: 'Task 1',
        priority: 'HIGH',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    taskId = res.body.data.id;
    expect(taskId).toBeDefined();
    expect(res.body.data.storyId).toBe(storyId);
    expect(res.body.data.priority).toBe('HIGH');
  });

  it('/tasks (GET) - List Tasks', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);

    expect(res.body.success).toBe(true);
    const found = res.body.data.find((t: any) => t.id === taskId);
    expect(found).toBeDefined();
  });

  it('/tasks/:id (PATCH) - Update Task', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('/tasks/:id/dependencies (POST) - Dependency and HALTED logic', async () => {
    // 1. Create Task B
    const bRes = await request(app.getHttpServer())
      .post(`/stories/${storyId}/tasks`)
      .send({ title: 'Blocking Task B' })
      .expect(201);
    const taskBId = bRes.body.data.id;

    // 2. Block Task 1 with Task B
    const depRes = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/dependencies`)
      .send({ dependencyId: taskBId })
      .expect(201);

    expect(depRes.body.data.status).toBe('HALTED');

    // 3. Mark Task B as DONE
    await request(app.getHttpServer())
      .patch(`/tasks/${taskBId}`)
      .send({ status: 'DONE' })
      .expect(200);

    // 4. Check Task 1 - should be TODO (or whatever it was before HALTED, but logic says TODO if was HALTED)
    const checkRes = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200);

    expect(checkRes.body.data.status).toBe('TODO');
  });
});
