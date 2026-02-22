import { z } from 'zod';

export const CreateCalendarEventSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(['MEETING', 'BREAK', 'OOO', 'OTHER']).default('OTHER'),
    start: z.string().datetime(),
    end: z.string().datetime(),
});

export class CreateCalendarEventDto implements z.infer<typeof CreateCalendarEventSchema> {
    title: string;
    description?: string;
    type: 'MEETING' | 'BREAK' | 'OOO' | 'OTHER';
    start: string;
    end: string;
}
