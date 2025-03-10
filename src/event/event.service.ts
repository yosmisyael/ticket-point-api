import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventRequestDto } from './dto/event.dto';
import { ValidationService } from '../common/validation.service';
import { EventValidation } from './event.validation';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

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
      startDate: new Date(event.dateTime.startDate),
      endDate: new Date(event.dateTime.endDate),
      startTime: event.dateTime.startTime,
      endTime: event.dateTime.endTime,
      owner: {
        connect: { id: 2 },
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
}