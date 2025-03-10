import { Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CreateTierRequestDto } from './dto/tier.dto';
import { EventService } from '../event/event.service';
import { TierValidation } from './tier.validation';
import { Prisma } from '@prisma/client';

@Injectable()
export class TierService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
  ) { }

  async createTier(eventId: number, request: CreateTierRequestDto) {
    await this.eventService.validateEvent(eventId);

    const validatedData: Prisma.TierCreateInput = await this.validationService.validate(TierValidation.CREATE, request);

    validatedData.remains = validatedData.capacity;

    validatedData.event = {
      connect: {
        id: eventId,
      }
    }

    const result = await this.prismaService.tier.create({
      data: validatedData,
      select: {
        id: true,
      },
    });

    return {
      id: result.id,
      message: 'success',
    };
  }
}