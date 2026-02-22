import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class StagesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.projectStage.findMany({
            orderBy: { order: 'asc' },
        });
    }
}
