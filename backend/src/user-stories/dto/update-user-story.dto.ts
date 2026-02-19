import { CreateUserStorySchema } from './create-user-story.dto';
import { z } from 'zod';

export const UpdateUserStorySchema = CreateUserStorySchema.partial();

export class UpdateUserStoryDto implements z.infer<
  typeof UpdateUserStorySchema
> {
  title?: string;
  description?: string;
}
