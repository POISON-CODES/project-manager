import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  formTemplateId: z.string().uuid(),
  formData: z.record(z.string(), z.any()), // Validated dynamically against template schema in service
});

export class CreateProjectDto implements z.infer<typeof CreateProjectSchema> {
  name: string;
  description?: string;
  formTemplateId: string;
  formData: Record<string, any>;
}
