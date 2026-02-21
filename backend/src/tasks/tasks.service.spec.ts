import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let workflows: WorkflowsService;

  const mockPrisma = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockWorkflows = {
    trigger: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: WorkflowsService,
          useValue: mockWorkflows,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    workflows = module.get<WorkflowsService>(WorkflowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { title: 'New Task' };
      mockPrisma.task.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create('story-1', dto as any);
      expect(result.id).toBe('1');
      expect(mockPrisma.task.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
