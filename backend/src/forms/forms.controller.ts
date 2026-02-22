import {
  Controller,
  Get,
  Post,
  Patch,
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

const CreateFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  schema: z.record(z.string(), z.any()).optional(), // Made optional for initial outline
  fields: z.array(z.any()).optional(), // Support direct fields array
});

class CreateFormDto implements z.infer<typeof CreateFormSchema> {
  title: string;
  description?: string;
  schema?: Record<string, any>;
  fields?: any[];
}

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) { }

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
    const schema = createFormDto.schema || (createFormDto.fields ? { fields: createFormDto.fields } : {});
    const data = await this.formsService.create({
      title: createFormDto.title,
      description: createFormDto.description,
      schema: schema as any,
      isActive: true,
      version: "1.0.0",
    } as any);

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
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const data = await this.formsService.findAll();
    const mapped = data.map((f: any) => ({
      ...f,
      fields: f.schema?.fields || f.schema?.sections?.flatMap((s: any) => s.fields) || [],
    }));
    return {
      success: true,
      data: mapped,
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
    const f = form as any;
    return {
      success: true,
      data: {
        ...form,
        fields: f.schema?.fields || f.schema?.sections?.flatMap((s: any) => s.fields) || [],
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
    const f = form as any;
    return {
      success: true,
      data: {
        ...form,
        fields: f.schema?.fields || f.schema?.sections?.flatMap((s: any) => s.fields) || [],
      },
    };
  }

  /**
   * Update an existing form template (Admin/Project Lead only).
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    // Sanitary Mapping: Only allow valid database fields
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;
    if (body.version) updateData.version = body.version;

    if (body.fields) {
      // If direct fields are provided (from the builder), wrap them correctly
      updateData.schema = { fields: body.fields };
    } else if (body.schema) {
      updateData.schema = body.schema;
    }

    // Update the record
    const data = await this.formsService.update(id, updateData);
    return {
      success: true,
      data,
    };
  }
}
