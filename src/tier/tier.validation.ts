import { z, ZodType } from 'zod';

export class TierValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string(),
    price: z.number().min(1),
    capacity: z.number().min(1),
    currency: z.string(),
    icon: z.string(),
    iconColor: z.string(),
    format: z.enum(['ONLINE', 'ONSITE', 'HYBRID']),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().optional(),
    price: z.number().min(1).optional(),
    capacity: z.number().min(1).optional(),
    remains: z.number().min(1).optional(),
    currency: z.string().optional(),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    format: z.enum(['ONLINE', 'ONSITE', 'HYBRID']).optional(),
  });
}