import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.length < 2) {
      return { projects: [], stories: [], tasks: [] };
    }

    const [projects, stories, tasks] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.userStory.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { project: { select: { name: true } } },
        take: 10,
      }),
      this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          story: { include: { project: { select: { name: true } } } },
        },
        take: 20,
      }),
    ]);

    return { projects, stories, tasks };
  }
}
