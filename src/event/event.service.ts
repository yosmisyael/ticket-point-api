import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateEventRequestDto, UpdateEventRequestDto } from './dto/event.dto';
import { ValidationService } from '../common/validation.service';
import { EventValidation } from './event.validation';
import { PrismaService } from '../common/prisma.service';
import { Prisma, Event } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService
    ) {
  }
  async createEvent(request: CreateEventRequestDto): Promise<{ message: string }> {
    const data = await this.validationService.validate(EventValidation.CREATE, request);

    const event = { ...data.event }

    const validatedData: Prisma.EventCreateInput = {
      title: event.title,
      description: event.description,
      format: event.format.type,
      coverImage: event.coverImage,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      startTime: event.startTime,
      endTime: event.endTime,
      owner: {
        connect: { id: 2 },
      },
      location: {
        create: {
          ...(event.format.onsite && {
            venue: event.format.onsite.venue,
            address: event.format.onsite.address,
            mapUrl: event.format.onsite.mapUrl,
            latitude: event.format.onsite.latitude,
            longitude: event.format.onsite.longitude,
          }),

          ...(event.format.online && {
            platform: event.format.online.platform,
            platformUrl: event.format.online.platformUrl,
          }),
        }
      },
      categories: {
        connectOrCreate: {
          where: { name: event.category.toLowerCase() }, // Ensure `name` is unique in the schema
          create: { name: event.category },
        },
      },
      agendas: {
        create: event.additionalInfo.agenda.items.map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
          title: item.title,
        })),
      },
      faqs: {
        create: event.additionalInfo.faq.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
      },
    };

    const result = await this.prismaService.event.create({
      data: validatedData,
      select: {
        id: true,
        title: true,
      }
    });

    if (!result.id) {
      throw new BadRequestException('Failed to create event due to invalid payload');
    }

    return {
      message: 'Success'
    };
  }

  async getEventById(id: number): Promise<Event> {
    const result = await this.prismaService.event.findFirst({
      where: {
        id: id
      },
      include: {
        location: {
          select: {
            id: true,
            mapUrl: true,
            venue: true,
            latitude: true,
            longitude: true,
            address: true,
            platform: true,
            platformUrl: true,
          }
        },
        categories: {
          select: {
            name: true,
            id: true,
          },
        },
        faqs: {
          select: {
            id: true,
            question: true,
            answer: true,
          }
        },
        agendas: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            title: true,
          }
        }
      }
    })

    if (!result) {
      throw new HttpException('Event not found', 404);
    }

    return result;
  }

  async searchEvents(filters: {
    title?: string,
    category?: string,
    ownerId?: number,
  }): Promise<Event[]> {
    const { title, category, ownerId } = filters;

    const where: any = {};

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.categories = {
        some: {
          name: {
            equals: category,
            mode: 'insensitive',
          },
        },
      };
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const result = await this.prismaService.event.findMany({
      where,
      include: {
        location: {
          select: {
            id: true,
            mapUrl: true,
            venue: true,
            latitude: true,
            longitude: true,
            address: true,
            platform: true,
            platformUrl: true,
          }
        },
        categories: {
          select: {
            name: true,
            id: true,
          },
        },
        faqs: {
          select: {
            id: true,
            question: true,
            answer: true,
          }
        },
        agendas: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            title: true,
          }
        }
      }
    })

    if (!result) {
      throw new HttpException('Event not found', 404);
    }

    return result;
  }

  async updateEvent(request: UpdateEventRequestDto) {

  }
}