import { HttpException, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CreateTierRequestDto } from './dto/tier.dto';
import { EventService } from '../event/event.service';
import { TierValidation } from './tier.validation';
import { Format, Prisma } from '@prisma/client';

@Injectable()
export class TierService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
  ) { }

  async validateTierUnique(name: string, format: Format) {
    const result = await this.prismaService.tier.findFirst({
      where: {
        name,
        format,
      }
    });

    if (result) {
      throw new HttpException('Tier is already exist', 400);
    }
  }

  async createTier(eventId: number, request: CreateTierRequestDto) {
    await this.eventService.validateEvent(eventId);

    const validatedData: Prisma.TierCreateInput = await this.validationService.validate(TierValidation.CREATE, request);

    await this.validateTierUnique(validatedData.name, validatedData.format);

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