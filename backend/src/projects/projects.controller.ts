import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { UserStoriesService } from '../user-stories/user-stories.service';
import { Query } from '@nestjs/common';
import {
  CreateProjectDto,
  CreateProjectSchema,
} from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  CreateUserStoryDto,
  CreateUserStorySchema,
} from '../user-stories/dto/create-user-story.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly userStoriesService: UserStoriesService,
  ) {}

  /**
   * Create a new project.
   *
   * @param createProjectDto - Project creation data.
   * @returns The created project.
   */
  @Post()
  @UsePipes(new ZodValidationPipe(CreateProjectSchema))
  async create(@Body() createProjectDto: CreateProjectDto) {
    const data = await this.projectsService.create(createProjectDto);
    return {
      success: true,
      data,
    };
  }

  // ... (Other methods unchanged or already viewed)

  /**
   * Create a User Story for a project.
   *
   * @param id - Project UUID.
   * @param createUserStoryDto - Story data.
   * @returns Created story.
   */
  @Post(':id/stories')
  @UsePipes(new ZodValidationPipe(CreateUserStorySchema))
  async createStory(
    @Param('id') id: string,
    @Body() createUserStoryDto: CreateUserStoryDto,
  ) {
    const data = await this.userStoriesService.create(id, createUserStoryDto);
    return { success: true, data };
  }

  @Get()
  async findAll() {
    const data = await this.projectsService.findAll();
    return {
      success: true,
      data,
    };
  }

  /**
   * Get project timeline hierarchy for Gantt views.
   *
   * @param userIds - Optional comma-separated user UUIDs for filtering.
   * @returns Hierarchical project-story-task data.
   */
  @Get('timeline')
  async getTimeline(@Query('userIds') userIds?: string) {
    const userIdArray = userIds ? userIds.split(',') : undefined;
    const data = await this.projectsService.getTimeline(userIdArray);
    return {
      success: true,
      data,
    };
  }

  /**
   * Get project details by ID.
   *
   * @param id - Project UUID.
   * @returns Project details.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.projectsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  /**
   * Claim a project (Assign to self).
   *
   * @param id - Project ID.
   * @param req - Request object containing user.
   * @returns Updated project.
   */
  @Patch(':id/claim')
  async claim(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    try {
      const data = await this.projectsService.claim(id, userId);
      return { success: true, data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update project stage.
   *
   * @param id - Project ID.
   * @param body - Body containing new stage.
   * @returns Updated project.
   */
  @Patch(':id/stage')
  async updateStage(@Param('id') id: string, @Body('stage') stage: string) {
    // Validate stage against enum if needed, or rely on Prisma throwing
    const data = await this.projectsService.updateStatus(id, stage as any);
    return { success: true, data };
  }

  // Stubs for future use, ensuring they comply with strict JSDoc if we keep them,
  // or removing them to avoid noise. User asked for *every* function to be documented.
  /**
   * Update a project.
   *
   * @param id - Project ID.
   * @param updateProjectDto - Update data.
   * @returns Update result.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  /**
   * Delete a project.
   *
   * @param id - Project ID.
   * @returns Deletion result.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
