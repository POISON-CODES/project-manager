import { z } from 'zod';

export const CreateWorkflowSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  triggerType: z.enum(['TASK_COMPLETED', 'PROJECT_CREATED', 'STORY_CREATED']),
  triggerConfig: z.record(z.any()).optional(),
  actions: z
    .array(
      z.object({
        type: z.enum(['HTTP_REQUEST']),
        config: z.record(z.any()), // e.g. { url: '...', method: 'POST' }
      }),
    )
    .min(1),
});

export class CreateWorkflowDto implements z.infer<typeof CreateWorkflowSchema> {
  name: string;
  description?: string;
  triggerType: 'TASK_COMPLETED' | 'PROJECT_CREATED' | 'STORY_CREATED';
  triggerConfig?: Record<string, any>;
  actions: {
    type: 'HTTP_REQUEST';
    config: Record<string, any>;
  }[];
}
