import { z } from 'zod';

export const SignupSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        name: z.string().min(1, 'Name is required'),
        phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    })
    .required();

export type SignupDto = z.infer<typeof SignupSchema>;
