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

const formatRules = z.object({
  type: z.enum(['ONLINE', 'ONSITE', 'HYBRID']),
  onsite: z.object({
    venue: z.string().min(1).max(100),
    address: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    mapUrl: z.string().url().optional(),
  }).optional(),
  online: z.object({
    platform: z.string().min(1).max(50),
    platformUrl: z.string().url()
  }).optional()
});

const additionalInfoRules = z.object({
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
}).optional();

export class EventValidation {
    static readonly CREATE: ZodType = z.object({
      event: z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        organizer: z.object({
          id: z.string().uuid(),
          name: z.string().min(1).max(100)
        }),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.number(),
        endTime: z.number(),
        format: formatRules,
        category: z.string().min(1).max(50),
        contact: z.object({
          email: z.string().email(),
          phone: z.string().optional(),
          website: z.string().url().optional()
        }),
        coverImage: z.string().url().optional(),
        additionalInfo: additionalInfoRules,
      })
    });

    static readonly UPDATE: ZodType = z.object({
      event: z.object({
        title: z.string().min(1).max(255).optional(),
        description: z.string().min(1).optional(),
        organizer: z.object({
          id: z.string().uuid(),
          name: z.string().min(1).max(100)
        }).optional(),
        isPublished: z.boolean().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        format: formatRules.optional(),
        category: z.string().min(1).max(50).optional(),
        contact: z.object({
          email: z.string().email(),
          phone: z.string().optional(),
          website: z.string().url().optional()
        }).optional(),
        coverImage: z.string().url().optional(),
        additionalInfo: additionalInfoRules,
      })
    })
}