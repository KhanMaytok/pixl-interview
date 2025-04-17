import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerOpts = formOptions({
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: '',
  }
});
