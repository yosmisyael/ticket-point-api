import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateEventRequestDto, EventResponseDto, UpdateEventRequestDto } from './dto/event.dto';
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
  async createEvent(request: CreateEventRequestDto): Promise<EventResponseDto> {
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
        connect: { id: 9 },
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
      id: result.id,
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

  async validateEvent(id: number): Promise<Boolean> {
    const result = await this.prismaService.event.findFirst({
      where: { id },
      select: {
        isPublished: true
      }
    });

    if (!result) {
      throw new HttpException('Event not found', 404);
    }

    return result.isPublished;
  }

  async updateEvent(id: number, request: UpdateEventRequestDto): Promise<EventResponseDto> {
    const isPublished = await this.validateEvent(id);

    const data = await this.validationService.validate(EventValidation.UPDATE, request);

    if (isPublished && data.event.isPublished == true) {
      throw new HttpException("Published event can't be updated", 400);
    }

    const event = { ...data.event };

    const eventUpdateData: Prisma.EventUpdateInput = {};

    if (event.title) {
      eventUpdateData.title = event.title;
    }

    if (event.description) {
      eventUpdateData.description = event.description;
    }

    if (event.coverImage) {
      eventUpdateData.coverImage = event.coverImage;
    }

    if (event.isPublished !== undefined) {
      eventUpdateData.isPublished = event.isPublished;
    }

    if (event.format?.type) {
      eventUpdateData.format = event.format.type;
    }

    if (event.startDate) {
      const requestedStartDate = new Date(event.startDate + 'T00:00:00Z');

      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));


      if (requestedStartDate < tomorrow) {
        throw new BadRequestException(
          'An event must be published at least one day before they start'
        );
      }
      eventUpdateData.startDate = requestedStartDate;
    }

    if (event.endDate) {
      const requestedEndDate = new Date(event.endDate + 'T00:00:00Z');

      const startDate = new Date(event.startDate + 'T00:00:00Z');

      if (requestedEndDate < startDate) {
        throw new BadRequestException(
          'An event must end after the start date of the event'
        );
      }

      eventUpdateData.endDate = requestedEndDate;
    }

    if (event.dateTime?.startTime !== undefined) {
      eventUpdateData.startTime = event.dateTime.startTime;
    }

    if (event.dateTime?.endTime !== undefined) {
      eventUpdateData.endTime = event.dateTime.endTime;
    }

    if (event.dateTime?.timezone) {
      eventUpdateData.timezone = event.dateTime.timezone;
    }

    if (event.category) {
      eventUpdateData.categories = {
        set: [],
        connectOrCreate: {
          where: { name: event.category.toLowerCase() },
          create: { name: event.category },
        },
      };
    }

    if (event.additionalInfo?.agenda?.items) {
      eventUpdateData.agendas = {
        deleteMany: {},
        create: event.additionalInfo.agenda.items.map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
          title: item.title,
        })),
      };
    }

    if (event.additionalInfo?.faq) {
      eventUpdateData.faqs = {
        deleteMany: {},
        create: event.additionalInfo.faq.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
      };
    }

    if (event.format) {
      const locationCreateData: Prisma.EventLocationCreateWithoutEventInput = {};
      const locationUpdateData: Prisma.EventLocationUpdateWithoutEventInput = {};

      if (event.format.onsite) {
        const { venue, address, latitude, longitude, venueNotes } = event.format.onsite;

        if (venue) {
          locationCreateData.venue = venue;
          locationUpdateData.venue = venue;
        }

        if (address) {
          locationCreateData.address = address;
          locationUpdateData.address = address;
        }

        if (latitude !== undefined) {
          locationCreateData.latitude = latitude;
          locationUpdateData.latitude = latitude;
        }
        if (longitude !== undefined) {
          locationCreateData.longitude = longitude;
          locationUpdateData.longitude = longitude;
        }
      }

      if (event.format.online) {
        const { platform, platformUrl } = event.format.online;

        if (platform) {
          locationCreateData.platform = platform;
          locationUpdateData.platform = platform;
        }

        if (platformUrl) {
          locationCreateData.platformUrl = platformUrl;
          locationUpdateData.platformUrl = platformUrl;
        }
      }

      if (event.format.type === 'ONLINE' && !event.format.onsite) {
        locationUpdateData.venue = null;
        locationUpdateData.address = null;
        locationUpdateData.latitude = null;
        locationUpdateData.longitude = null;
      }

      if (event.format.type === 'ONSITE' && !event.format.online) {
        locationUpdateData.platform = null;
        locationUpdateData.platformUrl = null;
      }

      if (Object.keys(locationUpdateData).length > 0) {
        eventUpdateData.location = {
          upsert: {
            create: locationCreateData,
            update: locationUpdateData,
          },
        };
      }
    }

    const result = await this.prismaService.event.update({
      where: { id },
      data: eventUpdateData,
      include: {
        categories: true,
        agendas: true,
        faqs: true,
        location: true,
      },
    });

    return {
      message: 'success',
      id: result.id,
    }
  }

  async deleteEvent(id: number): Promise<void> {
    const isPublished = await this.validateEvent(id);

    if (isPublished) {
      throw new BadRequestException('Cannot delete published event.')
    }

    await this.prismaService.event.update({
      where: { id },
      data: {
        categories: {
          set: [],
        },
      },
    });

    await this.prismaService.event.update({
      where: { id },
      data: {
        agendas: { deleteMany: {} },
        faqs: { deleteMany: {} },
        location: { delete: true },
      },
    });

    await this.prismaService.event.delete({
      where: { id },
    });
  }
}