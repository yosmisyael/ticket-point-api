import { z, ZodType } from 'zod';

export class TicketValidation {
  static readonly BOOKING: ZodType = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    organization: z.string().min(1),
    position: z.string().min(1),
    phone: z.string().min(1),
    tierId: z.number(),
  });

  static readonly VALIDATE: ZodType = z.object({
    credential: z.string().uuid({ message: 'Invalid ticket credential' }),
  });
}