import { HttpException, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CreateTierRequestDto, UpdateTierRequestDto } from './dto/tier.dto';
import { EventService } from '../event/event.service';
import { TierValidation } from './tier.validation';
import { Format, Prisma, Tier } from '@prisma/client';

@Injectable()
export class TierService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
  ) {}

  async validateTierUnique(name: string, format: Format) {
    const result = await this.prismaService.tier.findUnique({
      where: {
        name_format: {
          name,
          format,
        },
      },
    });

    if (result) {
      throw new HttpException('Tier is already exist', 400);
    }
  }

  async createTier(eventId: number, request: CreateTierRequestDto) {
    await this.eventService.validateEvent(eventId);

    const validatedData: CreateTierRequestDto =
      await this.validationService.validate(TierValidation.CREATE, request);

    await this.validateTierUnique(
      validatedData.name,
      validatedData.format as Format,
    );

    validatedData.remains = validatedData.capacity;

    const prepData: Prisma.TierCreateInput = {
      name: validatedData.name,
      price: validatedData.price as number,
      currency: validatedData.currency,
      capacity: validatedData.capacity,
      remains: validatedData.remains,
      icon: validatedData.icon,
      iconColor: validatedData.iconColor,
      format: validatedData.format as Format,
      tierBenefits: {
        create: validatedData.benefits.map((benefit: string) => ({
          description: benefit,
        })),
      },
      event: {
        connect: {
          id: eventId,
        },
      },
    };

    const result = await this.prismaService.tier.create({
      data: prepData,
      select: {
        id: true,
      },
    });

    return {
      id: result.id,
      message: 'success',
    };
  }

  async updateTier(
    eventId: number,
    tierId: number,
    request: UpdateTierRequestDto,
  ) {
    const isPublished = await this.eventService.validateEvent(eventId);

    const validatedData: UpdateTierRequestDto =
      await this.validationService.validate(TierValidation.UPDATE, request);

    const oldData = await this.prismaService.tier.findFirst({
      where: { id: tierId },
    });

    if (!oldData) {
      throw new HttpException('Tier not found', 400);
    }

    if (isPublished) {
      const hasOtherChanges = Object.keys(validatedData).some(
        (key) => key !== 'remains' && key !== 'event',
      );

      if (hasOtherChanges) {
        throw new HttpException(
          'Tickets cannot be updated for published events',
          403,
        );
      }

      if ((validatedData.remains as number) > oldData.capacity) {
        throw new HttpException(
          'Ticket capacity should not less than remaining ticket',
          400,
        );
      }
    } else {
      if (validatedData.name || validatedData.format) {
        await this.validateTierUnique(
          (validatedData.name as string) || oldData.name,
          (validatedData.format as Format) || oldData.format,
        );
      }

      if (validatedData.remains || validatedData.capacity) {
        if (
          validatedData.remains &&
          validatedData.remains > (validatedData.capacity || oldData.capacity)
        ) {
          validatedData.capacity = validatedData.remains;
        } else {
          validatedData.remains = validatedData.capacity;
        }
      }
    }

    const prepData: Prisma.TierUpdateInput = {
      name: validatedData.name,
      price: validatedData.price as number,
      currency: validatedData.currency,
      capacity: validatedData.capacity,
      remains: validatedData.remains,
      icon: validatedData.icon,
      iconColor: validatedData.iconColor,
      format: validatedData.format as Format,
      event: {
        connect: {
          id: eventId,
        },
      },
    };

    if (validatedData.benefits) {
      prepData.tierBenefits = {
        deleteMany: {},
        create:
          validatedData.benefits &&
          validatedData.benefits.map((benefit: string) => ({
            description: benefit,
          })),
      };
    }

    const result = await this.prismaService.tier.update({
      where: { id: tierId },
      data: prepData,
      select: {
        id: true,
      },
    });

    return {
      id: result.id,
      message: 'success',
    };
  }

  async getTiersByEventId(eventId: number): Promise<Tier[]> {
    await this.eventService.validateEvent(eventId);

    return this.prismaService.tier.findMany({
      where: { eventId },
      include: {
        tierBenefits: true,
      },
    });
  }
}