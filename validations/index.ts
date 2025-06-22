import { z } from 'zod';

export const signUpSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

export const manualDonationSchema = z.object({
    donorName: z.string().optional().nullable(),
    amount: z.number().positive(),
    method: z.string().optional().nullable(),
    notes: z.record(z.any()).optional().nullable(),
});

export const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});