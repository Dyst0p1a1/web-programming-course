import { z } from 'zod';

export const callbackSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export type CallbackInput = z.infer<typeof callbackSchema>;