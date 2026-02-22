import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(), // ISO date string
  estimatedMinutes: z.number().min(0).default(0),
  scheduledStart: z.string().datetime().nullable().optional(),
  scheduledEnd: z.string().datetime().nullable().optional(),
  assigneeId: z.string().uuid().optional(),
});

export class CreateTaskDto implements z.infer<typeof CreateTaskSchema> {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
  estimatedMinutes: number;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  assigneeId?: string;
}
