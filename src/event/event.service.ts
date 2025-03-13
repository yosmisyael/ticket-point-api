import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateEventRequestDto, EventResponseDto, UpdateEventRequestDto } from './dto/event.dto';
import { ValidationService } from '../common/validation.service';
import { EventValidation } from './event.validation';
import { PrismaService } from '../common/prisma.service';
import { Prisma, Event } from '@prisma/client';
import { UserPayload } from '../auth/model/request.model';

@Injectable()
export class EventService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService
    ) {
  }
  async createEvent(user: UserPayload, payload: CreateEventRequestDto): Promise<EventResponseDto> {
    const data = await this.validationService.validate(EventValidation.CREATE, payload);

    const event = { ...data.event }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const startDateValidation = await this.validateEventDate(event.startDate, tomorrow, 'gte');

    if (!startDateValidation) {
      throw new BadRequestException('An event must start at least one day from today');
    }

    const requestedEndDate = new Date(event.endDate + 'T00:00:00Z');
    const startDate = new Date(event.startDate + 'T00:00:00Z');

    const isValid = await this.validateEventDate(requestedEndDate, startDate, 'gte');

    if (!isValid) {
      throw new BadRequestException('An event must end after or on the same date of start date of the event');
    }

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
        connect: { id: user.id },
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
        location: true,
        categories: {
          select: {
            name: true,
            id: true,
          },
        },
        faqs: true,
        agendas: true,
      }
    });

    if (!result) {
      throw new HttpException('Event not found', 404);
    }

    return result;
  }

  async getEventByOwnerId(id: number): Promise<Event[]> {
    const result = await this.prismaService.event.findMany({
      where: {
        ownerId: id
      },
      include: {
        location: true,
        categories: {
          select: {
            name: true,
            id: true,
          },
        },
        faqs: true,
        agendas: true,
      }
    });

    if (!result) {
      throw new HttpException('Event not found', 404);
    }

    return result;
  }

  getDateRange(timeFilter: string) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    switch (timeFilter) {
      case 'tomorrow':
        return {
          start: new Date(tomorrow.setHours(0, 0, 0, 0)),
          end: new Date(tomorrow.setHours(23, 59, 59, 999)),
        };
      case 'this weekend':
        return {
          start: new Date(startOfWeek.setDate(startOfWeek.getDate() + 5)),
          end: new Date(endOfWeek.setHours(23, 59, 59, 999)),
        };
      default:
        return null;
    }
  };

  async searchEvents(filters: {
    title?: string,
    category?: string,
    ownerId?: number,
    location?: string,
    time?: string,
  }): Promise<Event[]> {
    const dateRange = filters.time ? this.getDateRange(filters.time) : null;
    const result = await this.prismaService.event.findMany({
      where: {
        isPublished: true,
        ...(filters.title && {
          title: {
            contains: filters.title,
            mode: 'insensitive',
          },
        }),
        ...(filters.category && {
          categories: {
            some: {
              name: {
                equals: filters.category,
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(filters.ownerId && {
          ownerId: filters.ownerId,
        }),
        ...(filters.location && {
          location: {
            address: {
              contains: filters.location,
              mode: 'insensitive',
            },
          },
        }),
        ...(dateRange && {
          startDate: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        }),
      },
      include: {
        location: true,
        categories: {
          select: {
            name: true,
            id: true,
          },
        },
        faqs: true,
        agendas: true,
      }
    });

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

  async validateEventDate(requestedDate: Date, allowedDate: Date, type: 'lt' | 'lte' | 'gt' | 'gte') {
    const formattedRequestDate = new Date(requestedDate);

    const formattedAllowedDate = new Date(allowedDate);

    switch (type) {
      case 'lt':
        return formattedRequestDate < formattedAllowedDate;
      case 'lte':
        return formattedRequestDate <= formattedAllowedDate;
      case 'gt':
        return formattedRequestDate > formattedAllowedDate;
      case 'gte':
        return formattedRequestDate >= formattedAllowedDate;
      default:
        throw new Error('Invalid comparison type');
    }
  }

  async updateEvent(id: number, user: UserPayload, payload: UpdateEventRequestDto): Promise<EventResponseDto> {
    await this.validationService.validate(EventValidation.UPDATE, payload);

    const oldData = await this.prismaService.event.findFirst({
      where: {id},
    })

    if (!oldData) {
      throw new HttpException('Event not found', 404);
    }

    if (oldData.ownerId != user.id) {
      throw new UnauthorizedException('Unauthorized action');
    }

    const isPublished = oldData.isPublished;

    if (isPublished && (oldData.endDate < new Date() || oldData.startDate < new Date())) {
      throw new HttpException('Cannot update past event', 400);
    }

    const data = await this.validationService.validate(EventValidation.UPDATE, payload);

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
      if (event.isPublished) {
        const validateTiers = await this.prismaService.event.findFirst({
          where: { id },
          select: {
            tiers: true,
          }
        });

        if (!validateTiers || validateTiers.tiers.length == 0) {
          throw new BadRequestException('Event should have ticket plan before published');
        }
      }

      eventUpdateData.isPublished = event.isPublished;
    }

    if (event.format?.type) {
      eventUpdateData.format = event.format.type;
    }

    if (event.startDate) {
      const requestedStartDate = new Date(event.startDate + 'T00:00:00Z');
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const isValid = await this.validateEventDate(requestedStartDate, tomorrow, 'gte');

      if (!isValid) {
        throw new BadRequestException('An event must start at least one day from today');
      }

      eventUpdateData.startDate = requestedStartDate;
    }

    if (event.endDate) {
      const requestedEndDate = new Date(event.endDate + 'T00:00:00Z');
      const startDate = new Date(event.startDate + 'T00:00:00Z');

      const isValid = await this.validateEventDate(requestedEndDate, startDate, 'gte');

      if (!isValid) {
        throw new BadRequestException('An event must end after or on the same date of start date of the event');
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
        const { venue, address, latitude, longitude } = event.format.onsite;

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
      select: {
        id: true,
      }
    });

    return {
      message: 'success',
      id: result.id,
    }
  }

  async deleteEvent(id: number, user: UserPayload): Promise<EventResponseDto> {
    const event = await this.prismaService.event.findUnique({
      where: { id },
      select: {
        isPublished: true,
        endDate: true,
        ownerId: true,
      },
    });

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.ownerId !== user.id) {
      throw new UnauthorizedException('Unauthorized action');
    }

    if (event.isPublished) {
      throw new BadRequestException('Cannot delete published event');
    }

    const currentDate = new Date();
    if (event.endDate < currentDate) {
      throw new BadRequestException('Cannot delete past event.');
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

    return {
      message: 'success',
      id,
    }
  }
}