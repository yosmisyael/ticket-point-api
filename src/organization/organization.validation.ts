import { z } from 'zod';

export class OrganizationValidation extends Error {
  static readonly CREATE = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
  });

  static readonly UDPATE = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
  });
}

