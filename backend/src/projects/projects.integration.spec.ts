import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('Projects (Integration)', () => {
    let service: ProjectsService;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                DatabaseModule,
            ],
            providers: [ProjectsService],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // Example integration test that actually hits the DB (or a test DB)
    // Usually, we'd use a dedicated test database here.
    it('should list projects', async () => {
        const projects = await service.findAll();
        expect(Array.isArray(projects)).toBe(true);
    });
});
