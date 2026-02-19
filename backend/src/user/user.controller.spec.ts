import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockUserService = {
        findAll: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [{ id: '1', name: 'John' }];
            mockUserService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();
            expect(result).toEqual({ success: true, data: users });
        });
    });

    describe('getProfile', () => {
        it('should return request user', async () => {
            const user = { id: '1', email: 'test@test.com' };
            const req = { user };
            const result = await controller.getProfile(req);
            expect(result).toBe(user);
        });
    });
});
