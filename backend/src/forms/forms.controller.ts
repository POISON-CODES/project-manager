import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

// DTOs
const CreateFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  schema: z.record(z.string(), z.any()), // JSON Schema object
});

class CreateFormDto implements z.infer<typeof CreateFormSchema> {
  title: string;
  description?: string;
  schema: Record<string, any>;
}

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  /**
   * Create a new Form Template.
   *
   * @param createFormDto - The data to create the form template.
   * @returns The created form template.
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_LEAD)
  @Post()
  @UsePipes(new ZodValidationPipe(CreateFormSchema))
  async create(@Body() createFormDto: CreateFormDto) {
    const data = await this.formsService.create({
      name: createFormDto.title,
      description: createFormDto.description,
      schema: createFormDto.schema as any,
      isActive: true,
      version: 1,
    });

    return {
      success: true,
      data,
    };
  }

  /**
   * Unused findAll method.
   * Keeping for reference but should be removed or implemented properly if needed.
   *
   * @returns List of forms.
   */
  @Get()
  async findAll() {
    const data = await this.formsService.findAll();
    return {
      success: true,
      data,
    };
  }

  /**
   * Get a specific form template by ID.
   *
   * @param id - The ID of the form template.
   * @returns The form template details.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const form = await this.formsService.findOne(id);
    return {
      success: true,
      data: {
        id: form.id,
        title: form.name,
        description: form.description,
        schema: form.schema,
      },
    };
  }

  /**
   * Get a public form template schema by ID.
   * Accessible without authentication.
   *
   * @param id - The ID of the form template.
   * @returns The public form template details.
   */
  @Public()
  @Get(':id/public')
  async findOnePublic(@Param('id') id: string) {
    const form = await this.formsService.findOnePublic(id);
    return {
      success: true,
      data: {
        id: form.id,
        title: form.name,
        description: form.description,
        schema: form.schema,
      },
    };
  }
}
