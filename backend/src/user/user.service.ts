import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Find all users in the workspace.
   *
   * @returns List of users with basic info.
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update user details.
   *
   * @param id - User UUID.
   * @param data - Partial user object.
   * @returns Updated user.
   */
  async update(
    id: string,
    data: { role?: any; status?: any; name?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Get recent activities.
   *
   * @param userId - Optional User UUID. If provided, filters by user. If null, returns global.
   * @param limit - Number of activities to return (default 20).
   * @returns List of activities.
   */
  async getActivities(userId?: string, limit = 20) {
    return this.prisma.userActivity.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
  }

  /**
   * Find a specific user by ID.
   *
   * @param id - User UUID.
   * @returns User details.
   */
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
