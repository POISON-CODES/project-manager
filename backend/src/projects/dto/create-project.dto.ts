import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  formTemplateId: z.string(), // Allowing semantic IDs like 'generic-intake-form'
  formData: z.record(z.string(), z.any()),
  deadline: z.string().optional(),
});

export class CreateProjectDto implements z.infer<typeof CreateProjectSchema> {
  name: string;
  description?: string;
  formTemplateId: string;
  formData: Record<string, any>;
  deadline?: string;
}
