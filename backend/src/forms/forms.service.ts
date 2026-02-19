import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new form template in the database.
   *
   * @param data - The form template creation data.
   * @returns The created form template.
   */
  async create(data: Prisma.FormTemplateCreateInput) {
    return this.prisma.formTemplate.create({
      data,
    });
  }

  /**
   * Retrieve all form templates.
   *
   * @returns An array of form templates.
   */
  async findAll() {
    return this.prisma.formTemplate.findMany({});
  }

  /**
   * Find a specific form template by ID.
   * Throws NotFoundException if not found.
   *
   * @param id - The UUID of the form template.
   * @returns The form template.
   */
  async findOne(id: string) {
    const form = await this.prisma.formTemplate.findUnique({
      where: { id },
    });
    if (!form) {
      throw new NotFoundException(`FormTemplate with ID ${id} not found`);
    }
    return form;
  }

  /**
   * Find a public form template by ID.
   * Only returns active templates.
   * Throws NotFoundException if not found or inactive.
   *
   * @param id - The UUID of the form template.
   * @returns The form template.
   */
  async findOnePublic(id: string) {
    const form = await this.prisma.formTemplate.findUnique({
      where: { id },
    });
    if (!form || !form.isActive) {
      throw new NotFoundException(
        `FormTemplate with ID ${id} not found or inactive`,
      );
    }
    return form;
  }
}
