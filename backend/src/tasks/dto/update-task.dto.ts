import { CreateTaskSchema } from './create-task.dto';
import { z } from 'zod';

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'HALTED'])
    .optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export class UpdateTaskDto implements z.infer<typeof UpdateTaskSchema> {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'HALTED';
  assigneeId?: string | null;
  estimatedMinutes?: number;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
}
