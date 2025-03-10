import { ZodType, z } from 'zod';

const fileValidator = () => {
  return z.any()
    .refine(
      (file) => file?.mimetype && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype),
      { message: 'File must be a valid image (JPEG, PNG)' }
    )
    .refine(
      (file) => file?.size && file.size <= 5 * 1024 * 1024, // 5MB
      { message: 'File must be less than 5MB' }
    )
    .optional();
};

export class EventValidation {
    static readonly CREATE: ZodType = z.object({
    event: z.object({
      title: z.string().min(1).max(255),
      description: z.string().min(1),
      organizer: z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100)
      }),
      dateTime: z.object({
        type: z.enum(['single', 'range']),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.number(),
        endTime: z.number()
      }),
      format: z.object({
        type: z.enum(['ONLINE', 'ONSITE', 'HYBRID']),
        onsite: z.object({
          venueName: z.string().min(1).max(100),
          address: z.object({
            street: z.string().min(1).max(100),
            city: z.string().min(1).max(50),
            state: z.string().min(1).max(50),
            postalCode: z.string().min(1).max(20),
            country: z.string().min(1).max(50)
          }),
          coordinates: z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180)
          }),
          mapUrl: z.string().url().optional(),
          venueNotes: z.string().optional()
        }).optional(),
        online: z.object({
          platform: z.string().min(1).max(50),
          platformUrl: z.string().url()
        }).optional()
      }),
      category: z.string().min(1).max(50),
      capacity: z.object({
        total: z.number().int().positive(),
        onsite: z.number().int().nonnegative().optional(),
        online: z.number().int().nonnegative().optional()
      }),
      contact: z.object({
        email: z.string().email(),
        phone: z.string().optional(),
        website: z.string().url().optional()
      }),
      coverImage: z.string().url().optional(),
      additionalInfo: z.object({
        agenda: z.object({
          items: z.array(z.object({
            startTime: z.number(),
            endTime: z.number(),
            title: z.string().min(1).max(100)
          }))
        }).optional(),
        faq: z.array(z.object({
          question: z.string().min(1),
          answer: z.string().min(1)
        })).optional()
      }).optional()
    })
  }) 
}