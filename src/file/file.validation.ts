import { z, ZodType } from 'zod';

export class FileValidation {
  static readonly UPLOAD: ZodType = z.object({
    type: z.enum(['profile', 'event', 'tier', 'organization']),
    id: z.string(),
  });
}