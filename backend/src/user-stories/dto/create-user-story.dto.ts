import { z } from 'zod';

export const CreateUserStorySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  // projectId is passed via param
});

export class CreateUserStoryDto implements z.infer<
  typeof CreateUserStorySchema
> {
  title: string;
  description?: string;
}
