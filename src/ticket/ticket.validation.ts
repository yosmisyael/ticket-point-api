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
    orderId: z.string(),
  });

  static readonly VALIDATE: ZodType = z.object({
    credential: z.string().uuid({ message: 'Invalid ticket credential' }),
  });

  static readonly PAYMENT_VALIDATION: ZodType = z.object({
    order_id: z.string(),
    payment_type: z.string(),
    transaction_time: z.date(),
    transaction_status: z.string(),
    fraud_status: z.string(),
  });
}