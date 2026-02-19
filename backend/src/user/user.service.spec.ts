import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    const mockPrisma = {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const mockUsers = [{ id: '1', name: 'Test' }];
            mockPrisma.user.findMany.mockResolvedValue(mockUsers);

            const result = await service.findAll();
            expect(result).toEqual(mockUsers);
            expect(mockPrisma.user.findMany).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a user by ID', async () => {
            const mockUser = { id: '1', name: 'Test' };
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findOne('1');
            expect(result).toEqual(mockUser);
        });
    });
});
