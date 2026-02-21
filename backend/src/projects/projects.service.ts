import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../database/prisma.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) { }

  /**
   * Create a new project from an intake form submission.
   *
   * @param createProjectDto - Data for creating the project.
   * @returns The newly created project.
   */
  async create(createProjectDto: CreateProjectDto) {
    // 1. Verify Template Exists
    const template = await this.prisma.formTemplate.findUnique({
      where: { id: createProjectDto.formTemplateId },
    });
    if (!template) {
      throw new NotFoundException(
        `FormTemplate ${createProjectDto.formTemplateId} not found`,
      );
    }

    // 2. Create Project
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        formTemplateId: createProjectDto.formTemplateId,
        formData: createProjectDto.formData,
        status: 'PLANNING', // Default
      },
      include: {
        formTemplate: { select: { name: true } }, // Include template name for display
      },
    });

    // 3. Trigger Workflow
    await this.workflowsService.trigger('PROJECT_CREATED', project);

    return project;
  }

  /**
   * Retrieve all projects.
   *
   * @returns List of all projects.
   */
  async findAll() {
    const projects = await this.prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        stories: {
          include: {
            tasks: {
              select: { priority: true, status: true },
            },
          },
        },
      },
    });

    return projects.map((p) => {
      const allTasks = p.stories.flatMap((s) => s.tasks);
      const isHalted = allTasks.some((t) => t.status === 'HALTED') || p.status === 'ON_HOLD';

      return {
        ...p,
        isHalted,
        taskStats: {
          total: allTasks.length,
          low: allTasks.filter((t) => t.priority === 'LOW').length,
          medium: allTasks.filter((t) => t.priority === 'MEDIUM').length,
          high: allTasks.filter((t) => t.priority === 'HIGH').length,
          critical: allTasks.filter((t) => t.priority === 'CRITICAL').length,
        },
      };
    });
  }

  /**
   * Find a project by ID.
   *
   * @param id - UUID of the project.
   * @returns The project details.
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        stakeholder: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        formTemplate: { select: { id: true, name: true } },
        stories: {
          include: {
            tasks: {
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    const allTasks = project.stories.flatMap((s) => s.tasks);
    const isHalted = allTasks.some((t) => t.status === 'HALTED') || project.status === 'ON_HOLD';

    return {
      ...project,
      isHalted,
      taskStats: {
        total: allTasks.length,
        low: allTasks.filter((t) => t.priority === 'LOW').length,
        medium: allTasks.filter((t) => t.priority === 'MEDIUM').length,
        high: allTasks.filter((t) => t.priority === 'HIGH').length,
        critical: allTasks.filter((t) => t.priority === 'CRITICAL').length,
      },
    };
  }

  /**
   * Claim a project (assign to self).
   *
   * @param id - Project UUID.
   * @param userId - User UUID of the claimer.
   * @returns The updated project.
   */
  async claim(id: string, userId: string) {
    const project = await this.findOne(id);
    if (project.ownerId) {
      throw new Error(
        `Project ${id} is already assigned to ${project.ownerId}`,
      ); // Should be ConflictException in controller or here
    }
    return this.prisma.project.update({
      where: { id },
      data: { ownerId: userId, status: 'ACTIVE' }, // Auto-activate on claim? Maybe. Let's keep status manual for now or ACTIVE.
      include: { owner: { select: { id: true, name: true } } },
    });
  }

  /**
   * Update the project stage/status.
   *
   * @param id - Project UUID.
   * @param status - New ProjectStatus.
   * @returns The updated project.
   */
  async updateStatus(id: string, status: ProjectStatus) {
    return this.prisma.project.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Get project hierarchy with timeline data for Gantt charts.
   *
   * @param userIds - Optional array of user UUIDs to filter tasks.
   * @returns Hierarchical project data with stories and tasks.
   */
  async getTimeline(userIds?: string[]) {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        stories: {
          include: {
            tasks: {
              where:
                userIds && userIds.length > 0
                  ? {
                    assigneeId: { in: userIds },
                  }
                  : {},
              include: {
                assignee: { select: { id: true, name: true, avatarUrl: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  /**
   * Update project details (Basic info).
   *
   * @param id - Project UUID.
   * @param updateProjectDto - Update data.
   * @returns The updated project.
   */
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  /**
   * Remove a project (Soft delete).
   *
   * @param id - Project UUID.
   * @returns The deleted project.
   */
  async remove(id: string) {
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
