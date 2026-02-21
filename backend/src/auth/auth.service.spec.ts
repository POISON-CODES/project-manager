import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: { upsert: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncUserManual', () => {
    it('should upsert user with correct data', async () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      await service.syncUserManual(userData);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id' },
          create: expect.objectContaining({
            email: 'test@example.com',
            name: 'Test User',
          }),
        }),
      );
    });
  });
});
