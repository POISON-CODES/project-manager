import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  UsePipes,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  CreateWorkflowSchema,
} from './dto/create-workflow.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PROJECT_LEAD)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) { }

  /**
   * Create a new workflow automation rule.
   *
   * @param createWorkflowDto - Workflow configuration.
   * @returns Created workflow.
   */
  @UsePipes(new ZodValidationPipe(CreateWorkflowSchema))
  @Post()
  async create(@Body() createWorkflowDto: CreateWorkflowDto) {
    const data = await this.workflowsService.create(createWorkflowDto);
    return { success: true, data };
  }

  /**
   * List all active workflows.
   *
   * @returns List of workflows.
   */
  @Get()
  async findAll() {
    const data = await this.workflowsService.findAll();
    return { success: true, data };
  }
}
