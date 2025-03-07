import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email().min(1).max(255),
    name: z.string().min(1).max(255),
    password: z.string().min(1).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().min(1).max(255),
    password: z.string().min(1).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().min(1).max(255).optional(),
    password: z.string().min(1).max(100).optional(),
  });
}
