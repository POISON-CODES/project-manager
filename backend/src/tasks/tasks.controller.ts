import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
  Req,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskSchema } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Note: Creation of task is via User Stories Controller

  /**
   * Get all tasks (Kanban view data).
   *
   * @param status - Optional TaskStatus filter.
   * @param userIds - Optional comma-separated user UUIDs for filtering.
   * @returns List of tasks.
   */
  @Get()
  async findAll(
    @Query('status') status?: TaskStatus,
    @Query('userIds') userIds?: string,
  ) {
    const userIdArray = userIds ? userIds.split(',') : undefined;
    const data = await this.tasksService.findAll(status, userIdArray);
    return { success: true, data };
  }

  /**
   * Get task details.
   *
   * @param id - Task UUID.
   * @returns Task details.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.tasksService.findOne(id);
    return { success: true, data };
  }

  /**
   * Update a task (status, assignee, etc.).
   *
   * @param id - Task UUID.
   * @param updateTaskDto - Update data.
   * @returns Updated task.
   */
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateTaskSchema))
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const data = await this.tasksService.update(id, updateTaskDto);
    return { success: true, data };
  }

  /**
   * Assign a task to a user.
   *
   * @param id - Task ID.
   * @param assigneeId - User ID (can be null to unassign).
   * @returns Updated task.
   */
  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string | null,
  ) {
    const data = await this.tasksService.update(id, { assigneeId });
    return { success: true, data };
  }

  /**
   * Add a dependency to a task.
   *
   * @param id - Task ID.
   * @param dependencyId - ID of the task that blocks this one.
   * @returns Updated task.
   */
  @Post(':id/dependencies')
  async addDependency(
    @Param('id') id: string,
    @Body('dependencyId') dependencyId: string,
  ) {
    const data = await this.tasksService.addDependency(id, dependencyId);
    return { success: true, data };
  }

  /**
   * Remove a dependency from a task.
   *
   * @param id - Task ID.
   * @param depId - ID of the dependency to remove.
   * @returns Updated task.
   */
  @Delete(':id/dependencies/:depId')
  async removeDependency(
    @Param('id') id: string,
    @Param('depId') depId: string,
  ) {
    const data = await this.tasksService.removeDependency(id, depId);
    return { success: true, data };
  }

  /**
   * Delete a task.
   *
   * @param id - Task UUID.
   * @returns Deletion result.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.tasksService.remove(id);
    return { success: true, data };
  }

  /**
   * Get comments for a task.
   *
   * @param id - Task ID.
   * @returns List of comments.
   */
  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    const data = await this.tasksService.getComments(id);
    return { success: true, data };
  }

  /**
   * Add a comment to a task.
   *
   * @param id - Task ID.
   * @param body - Comment content.
   * @param req - Request containing user info.
   * @returns Created comment.
   */
  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    const data = await this.tasksService.addComment(id, userId, content);
    return { success: true, data };
  }
}
