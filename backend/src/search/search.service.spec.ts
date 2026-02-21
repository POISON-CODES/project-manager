import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../database/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;

  const mockPrisma = {
    project: { findMany: jest.fn() },
    userStory: { findMany: jest.fn() },
    task: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('globalSearch', () => {
    it('should return empty results if query is too short', async () => {
      const result = await service.globalSearch('a');
      expect(result).toEqual({ projects: [], stories: [], tasks: [] });
    });

    it('should call prisma findMany for projects, stories, and tasks', async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        { id: '1', name: 'Project 1' },
      ]);
      mockPrisma.userStory.findMany.mockResolvedValue([
        { id: '2', title: 'Story 1' },
      ]);
      mockPrisma.task.findMany.mockResolvedValue([
        { id: '3', title: 'Task 1' },
      ]);

      const result = await service.globalSearch('test');

      expect(prisma.project.findMany).toHaveBeenCalled();
      expect(prisma.userStory.findMany).toHaveBeenCalled();
      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(result.projects).toHaveLength(1);
    });
  });
});
