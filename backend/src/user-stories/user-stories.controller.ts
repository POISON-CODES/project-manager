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
} from '@nestjs/common';
import { UserStoriesService } from './user-stories.service';
import { CreateUserStoryDto } from './dto/create-user-story.dto';
import {
  UpdateUserStoryDto,
  UpdateUserStorySchema,
} from './dto/update-user-story.dto';
import { CreateTaskDto, CreateTaskSchema } from '../tasks/dto/create-task.dto';
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('stories') // Resource is 'stories'
@UseGuards(JwtAuthGuard)
export class UserStoriesController {
  constructor(
    private readonly userStoriesService: UserStoriesService,
    private readonly tasksService: TasksService,
  ) {}

  // ... (Other methods unchanged or already viewed)

  /**
   * Find a story by ID.
   *
   * @param id - Story UUID.
   * @returns Story details.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userStoriesService.findOne(id);
    return { success: true, data };
  }

  /**
   * Update a story.
   *
   * @param id - Story UUID.
   * @param updateUserStoryDto - Update data.
   * @returns Updated story.
   */
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateUserStorySchema))
  async update(
    @Param('id') id: string,
    @Body() updateUserStoryDto: UpdateUserStoryDto,
  ) {
    const data = await this.userStoriesService.update(id, updateUserStoryDto);
    return { success: true, data };
  }

  /**
   * Delete a story.
   *
   * @param id - Story UUID.
   * @returns Deletion result.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.userStoriesService.remove(id);
    return { success: true, data };
  }

  /**
   * Create a Task for a story.
   *
   * @param id - Story UUID.
   * @param createTaskDto - Task data.
   * @returns Created task.
   */
  @Post(':id/tasks')
  @UsePipes(new ZodValidationPipe(CreateTaskSchema))
  async createTask(
    @Param('id') id: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const data = await this.tasksService.create(id, createTaskDto);
    return { success: true, data };
  }
}
