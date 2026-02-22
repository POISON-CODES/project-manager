import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../database/prisma.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) { }

  /**
   * Calculate buffer and total minutes (15% rule).
   */
  private calculateScheduling(estimatedMinutes: number) {
    const bufferMinutes = Math.ceil(estimatedMinutes * 0.15);
    return {
      estimatedMinutes,
      bufferMinutes,
      totalMinutes: estimatedMinutes + bufferMinutes,
    };
  }

  /**
   * Create a new task.
   *
   * @param storyId - User Story UUID.
   * @param createTaskDto - Task data.
   * @returns Created task.
   */
  async create(storyId: string, createTaskDto: CreateTaskDto) {
    const schedulingData = this.calculateScheduling(createTaskDto.estimatedMinutes || 0);

    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        ...schedulingData,
        storyId,
      },
    });
  }

  /**
   * Find all tasks (optionally filtered by status or assignees).
   *
   * @param status - Optional TaskStatus filter.
   * @param userIds - Optional array of user UUIDs for filtering.
   * @returns List of tasks.
   */
  async findAll(status?: TaskStatus, userIds?: string[]) {
    return this.prisma.task.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(userIds && userIds.length > 0
          ? { assigneeId: { in: userIds } }
          : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        blockedBy: { select: { id: true, title: true, status: true } },
      } as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a specific task.
   *
   * @param id - Task UUID.
   * @returns Task details.
   */
  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        blockedBy: { select: { id: true, title: true, status: true } },
        blocking: { select: { id: true, title: true, status: true } },
        comments: true,
      } as any,
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  /**
   * Update a task.
   *
   * @param id - Task UUID.
   * @param updateTaskDto - Update data.
   * @returns Updated task.
   */
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const originalTask = await this.findOne(id);

    const data: any = { ...updateTaskDto };

    if (updateTaskDto.estimatedMinutes !== undefined) {
      const schedulingData = this.calculateScheduling(updateTaskDto.estimatedMinutes);
      Object.assign(data, schedulingData);
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
    });

    // If status changed, recalculate tasks blocked by this one
    if (updateTaskDto.status && updateTaskDto.status !== originalTask.status) {
      await this.recalculateBlockedTasks(id);

      // Trigger Workflow if DONE
      if (updateTaskDto.status === 'DONE') {
        await this.workflowsService.trigger('TASK_COMPLETED', task);
      }
    }

    return task;
  }

  /**
   * Add a dependency (this task is blocked by another).
   *
   * @param id - Task ID being blocked.
   * @param blockedByTaskId - Task ID that is blocking.
   * @returns Updated task.
   */
  async addDependency(id: string, blockedByTaskId: string) {
    if (id === blockedByTaskId) throw new Error('Task cannot block itself');

    await this.prisma.task.update({
      where: { id },
      data: {
        blockedBy: { connect: { id: blockedByTaskId } },
      } as any,
    });

    return this.updateHaltedStatus(id);
  }

  /**
   * Remove a dependency.
   *
   * @param id - Task ID being unblocked.
   * @param blockedByTaskId - Task ID to remove from dependencies.
   * @returns Updated task.
   */
  async removeDependency(id: string, blockedByTaskId: string) {
    await this.prisma.task.update({
      where: { id },
      data: {
        blockedBy: { disconnect: { id: blockedByTaskId } },
      } as any,
    });

    return this.updateHaltedStatus(id);
  }

  /**
   * Recalculate if a task should be HALTED based on its dependencies.
   *
   * @param id - Task ID.
   * @returns Updated task.
   */
  async updateHaltedStatus(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { blockedBy: { select: { status: true } } } as any,
    });

    if (!task) return null;

    const t = task as any;
    const isBlocked = (t.blockedBy || []).some((dep: any) => dep.status !== 'DONE');

    // Logic: If blocked, status must be HALTED.
    // If not blocked and was HALTED, move to TODO.
    let newStatus: TaskStatus = task.status;
    if (isBlocked) {
      newStatus = 'HALTED';
    } else if (task.status === 'HALTED') {
      newStatus = 'TODO';
    }

    if (newStatus !== task.status) {
      return this.prisma.task.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return task;
  }

  /**
   * Recalculate status for all tasks blocked by the given task.
   *
   * @param taskId - The task that might have changed status.
   */
  private async recalculateBlockedTasks(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { blocking: { select: { id: true } } } as any,
    });

    if (!task) return;

    for (const b of task.blocking) {
      await this.updateHaltedStatus(b.id);
    }
  }

  /**
   * Remove a task.
   *
   * @param id - Task UUID.
   * @returns Deleted task.
   */
  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Get all comments for a task.
   *
   * @param taskId - Task UUID.
   * @returns List of comments with author info.
   */
  async getComments(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add a comment to a task.
   *
   * @param taskId - Task UUID.
   * @param authorId - Authenticated User UUID.
   * @param content - Comment text.
   * @returns The created comment.
   */
  async addComment(taskId: string, authorId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        content,
        taskId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }
}
