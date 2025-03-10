import { z, ZodType } from 'zod';

export class TicketValidation {
  static readonly BOOK: ZodType = z.object({
    email: z.string().email(),
    attendee: z.string().min(1),
    phone: z.string().min(1),
    tierId: z.number(),
  });

  static readonly VALIDATE: ZodType = z.object({
    credential: z.string().uuid({ message: 'Invalid ticket credential' }),
  });
}