import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginOpts = formOptions({
  defaultValues: {
    email: '',
    password: '',
  }
});
