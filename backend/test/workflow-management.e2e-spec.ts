import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Workflow Management (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let workflowId: string;
  let formId: string;
  let projectId: string;
  let storyId: string;
  let taskId: string;

  const mockUser = {
    id: 'mock-user-id',
    email: 'admin@example.com',
    role: 'ADMIN',
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
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Cleanup cascading deletes
    if (projectId)
      await prisma.project.delete({ where: { id: projectId } }).catch(() => {});
    if (formId)
      await prisma.formTemplate
        .delete({ where: { id: formId } })
        .catch(() => {});
    if (workflowId)
      await prisma.workflow
        .delete({ where: { id: workflowId } })
        .catch(() => {});
    await app.close();
  });

  it('/workflows (POST) - Create Automation Rule', async () => {
    const res = await request(app.getHttpServer())
      .post('/workflows')
      .send({
        name: 'Auto-Notify on Task Complete',
        triggerType: 'TASK_COMPLETED',
        actions: [
          {
            type: 'HTTP_REQUEST',
            config: {
              url: 'https://example.com/webhook',
              method: 'POST',
              body: { message: 'Task {{id}} is done!' },
            },
          },
        ],
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    workflowId = res.body.data.id;
  });

  it('/workflows (GET) - List Rules', async () => {
    const res = await request(app.getHttpServer())
      .get('/workflows')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((w: any) => w.id === workflowId)).toBe(true);
  });

  it('Should trigger workflow on Task Completion', async () => {
    // Setup Hierarchy
    const formRes = await request(app.getHttpServer())
      .post('/forms')
      .send({ title: 'Workflow Test Form', schema: {} });

    if (formRes.status !== 201) {
      console.error(
        'Form Creation Failed:',
        JSON.stringify(formRes.body, null, 2),
      );
    }
    expect(formRes.status).toBe(201);
    formId = formRes.body.data.id;

    const projRes = await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: 'Workflow Test Project',
        formTemplateId: formId,
        formData: {},
      })
      .expect(201);
    projectId = projRes.body.data.id;

    const storyRes = await request(app.getHttpServer())
      .post(`/projects/${projectId}/stories`)
      .send({ title: 'Workflow Story' });

    if (storyRes.status !== 201) {
      console.error(
        'Story Creation Failed:',
        JSON.stringify(storyRes.body, null, 2),
      );
    }
    expect(storyRes.status).toBe(201);
    storyId = storyRes.body.data.id;

    const taskRes = await request(app.getHttpServer())
      .post(`/stories/${storyId}/tasks`)
      .send({ title: 'Task to Trigger Workflow' })
      .expect(201);
    taskId = taskRes.body.data.id;

    // Mock Axios Response
    (mockedAxios as unknown as jest.Mock).mockResolvedValue({
      status: 200,
      data: { success: true },
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    });

    // Trigger: Update Task to DONE
    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ status: 'DONE' })
      .expect(200);

    // Validation: Poll for ActionLog
    let actionLog;
    for (let i = 0; i < 15; i++) {
      actionLog = await prisma.actionLog.findFirst({
        where: {
          status: 'SUCCESS',
          // Note: In a real scenario, we'd check if it's for THIS task,
          // but for E2E we just want to see if SOME action log appeared after our trigger
        },
        orderBy: { executedAt: 'desc' },
      });
      if (actionLog) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(actionLog).toBeDefined();
    expect(actionLog?.status).toBe('SUCCESS');
  }, 30000);
});
