import { z, ZodType } from 'zod';

const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .refine((value) => /[A-Z]/.test(value), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((value) => /[a-z]/.test(value), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((value) => /[0-9]/.test(value), {
    message: 'Password must contain at least one number',
  })
  .refine((value) => /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value), {
    message: 'Password must contain at least one special character',
  })
  .optional();

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email().min(1).max(255),
    name: z.string().min(1).max(255),
    password: passwordSchema,
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().min(1).max(255).email().optional(),
    password: passwordSchema,
    organizationId: z.string().min(1).optional(),
    profileUrl: z.string().url().optional()
  });

  static readonly REQUEST_OTP: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
}
