import { Injectable } from '@nestjs/common';
import { CreateUserStoryDto } from './dto/create-user-story.dto';
import { UpdateUserStoryDto } from './dto/update-user-story.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserStoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user story.
   *
   * @param projectId - Project UUID.
   * @param createUserStoryDto - Story data.
   * @returns Created story.
   */
  async create(projectId: string, createUserStoryDto: CreateUserStoryDto) {
    return this.prisma.userStory.create({
      data: {
        ...createUserStoryDto,
        projectId,
      },
    });
  }

  /**
   * Find all stories for a project.
   *
   * @param projectId - Project UUID.
   * @returns List of stories.
   */
  async findAllByProject(projectId: string) {
    return this.prisma.userStory.findMany({
      where: { projectId },
      include: { tasks: true },
    });
  }

  /**
   * Find a specific story.
   *
   * @param id - Story UUID.
   * @returns Story details.
   */
  async findOne(id: string) {
    return this.prisma.userStory.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  /**
   * Update a story.
   *
   * @param id - Story UUID.
   * @param updateUserStoryDto - Update data.
   * @returns Updated story.
   */
  async update(id: string, updateUserStoryDto: UpdateUserStoryDto) {
    return this.prisma.userStory.update({
      where: { id },
      data: updateUserStoryDto,
    });
  }

  /**
   * Remove a story.
   *
   * @param id - Story UUID.
   * @returns Deleted story.
   */
  async remove(id: string) {
    return this.prisma.userStory.delete({
      where: { id },
    });
  }
}
