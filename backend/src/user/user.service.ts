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
        phoneNumber: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find all users with detailed statistics.
   * Primarily for Admin management dashboard.
   */
  async findAllWithStats() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        phoneNumber: true,
        ownedProjects: {
          select: { id: true, currentStage: { select: { name: true } } }
        },
        stakeholderProjects: {
          select: { id: true, currentStage: { select: { name: true } } }
        },
        assignedTasks: {
          select: { id: true, status: true }
        },
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
    data: { role?: any; status?: any; name?: string; avatarUrl?: string; phoneNumber?: string },
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

  /**
   * Get detailed statistics for a specific user.
   */
  async getUserStats(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    const projectWhere = {
      OR: [{ ownerId: id }, { stakeholderId: id }],
      deletedAt: null,
    };

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalTasks,
      completedTasks,
      taskStatusGroups,
      involvedProjectsGroup,
      recentActivity,
      assignedTasks,
      projects
    ] = await Promise.all([
      // Project Tally
      this.prisma.project.count({ where: projectWhere }),
      this.prisma.project.count({
        where: {
          ...projectWhere,
          currentStage: { name: { in: ['Ongoing', 'Triage ongoing', 'In Queue', 'Feasibility Accepted'] } }
        }
      }),
      this.prisma.project.count({
        where: {
          ...projectWhere,
          currentStage: { name: 'Handover Complete' }
        }
      }),
      this.prisma.project.count({
        where: {
          ...projectWhere,
          currentStage: { name: { in: ['Halted for Stakeholder', 'Halted for Tech'] } }
        }
      }),
      // Task Stats
      this.prisma.task.count({ where: { assigneeId: id } }),
      this.prisma.task.count({ where: { assigneeId: id, status: 'DONE' } }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { assigneeId: id },
        _count: { _all: true }
      }),
      // Count unique projects from tasks
      this.prisma.task.groupBy({
        by: ['storyId'],
        where: { assigneeId: id },
        _count: { _all: true }
      }),
      // Recent Items
      this.prisma.userActivity.findMany({
        where: { userId: id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatarUrl: true } } }
      }),
      this.prisma.task.findMany({
        where: { assigneeId: id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          story: {
            include: {
              project: { select: { id: true, name: true } }
            }
          }
        }
      }),
      this.prisma.project.findMany({
        where: projectWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { currentStage: true }
      })
    ]);

    const taskStatusDistribution = taskStatusGroups.reduce((acc: any, curr: any) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {});

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
      },
      stats: {
        taskStatusDistribution,
        projectTally: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          onHold: onHoldProjects,
        },
        totalTasks,
        completedTasks,
        taskEfficiency: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        involvedProjectsCount: involvedProjectsGroup.length,
      },
      recentActivity,
      assignedTasks,
      projects,
    };
  }

  /**
   * Create a new user.
   */
  async create(data: any) {
    return this.prisma.user.create({
      data,
    });
  }
}
