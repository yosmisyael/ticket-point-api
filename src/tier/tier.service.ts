import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CreateTierRequestDto, TierResponseDto, UpdateTierRequestDto } from './dto/tier.dto';
import { EventService } from '../event/event.service';
import { TierValidation } from './tier.validation';
import { Format, Prisma, Tier } from '@prisma/client';
import { UserPayload } from '../auth/model/request.model';

@Injectable()
export class TierService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
  ) {}

  async validateTierExists(tierId: number): Promise<void> {
    const result = await this.prismaService.tier.findFirst({
      where: {
        id: tierId,
      },
    });

    if (!result) {
      throw new HttpException('Tier not found', HttpStatus.NOT_FOUND);
    }
  }

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

  async validateTierAuthorization(userId: number, eventId: number) {
    const event = await this.prismaService.event.findFirst({
      where: {
        id: eventId
      },
      select: {
        ownerId: true,
        isPublished: true,
      }
    });

    if (!event) {
      throw new HttpException('Event not found', 400);
    }

    if (event.ownerId !== userId) {
      throw new UnauthorizedException('Unauthorized action');
    }

    if (event.isPublished) {
      throw new HttpException('Cannot add, update, or delete tier to published event', 400)
    }
  }

  async createTier(user: UserPayload, eventId: number, request: CreateTierRequestDto): Promise<TierResponseDto> {
    await this.validateTierAuthorization(user.id, eventId);

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

  async createTiers(
    user: UserPayload,
    eventId: number,
    requests: CreateTierRequestDto[], // Accept an array of CreateTierRequestDto
  ): Promise<TierResponseDto[]> {
    // Validate user authorization for the event
    await this.validateTierAuthorization(user.id, eventId);

    // Validate each request in the array
    const validatedData: CreateTierRequestDto[] = await Promise.all(
      requests.map(async (request) => {
        return this.validationService.validate(TierValidation.CREATE, request);
      }),
    );

    // Check for uniqueness of tier names and formats
    await Promise.all(
      validatedData.map(async (data) => {
        await this.validateTierUnique(data.name, data.format as Format);
      }),
    );

    // Prepare data for Prisma createMany
    const prepData: Prisma.TierCreateManyInput[] = validatedData.map((data) => {
      return {
        name: data.name,
        price: data.price as number,
        currency: data.currency,
        capacity: data.capacity,
        remains: data.capacity, // Set remains equal to capacity initially
        icon: data.icon,
        iconColor: data.iconColor,
        format: data.format as Format,
        eventId: eventId, // Connect to the event
      };
    });

    // Use Prisma's createMany to insert multiple tiers
    const result = await this.prismaService.tier.createMany({
      data: prepData,
    });

    // Fetch the IDs of the created tiers
    const createdTiers = await this.prismaService.tier.findMany({
      where: {
        eventId: eventId,
        name: {
          in: validatedData.map((data) => data.name),
        },
      },
      select: {
        id: true,
      },
    });

    // Create tier benefits for each created tier
    await Promise.all(
      validatedData.map(async (data, index) => {
        const tierId = createdTiers[index].id;
        await this.prismaService.tierBenefit.createMany({
          data: data.benefits.map((benefit: string) => ({
            description: benefit,
            tierId: tierId,
          })),
        });
      }),
    );

    // Return the response for each created tier
    return createdTiers.map((tier) => ({
      id: tier.id,
      message: 'success',
    }));
  }

  async updateTier(
    user: UserPayload,
    eventId: number,
    tierId: number,
    request: UpdateTierRequestDto,
  ): Promise<TierResponseDto> {
    await this.validateTierExists(Number(tierId));

    await this.validateTierAuthorization(user.id, eventId);

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
    console.log(eventId)
    return this.prismaService.tier.findMany({
      where: { eventId },
      include: {
        tierBenefits: true,
      },
    });
  }

  async deleteTier(user: UserPayload, eventId: number, tierId: number): Promise<TierResponseDto> {
    await this.validateTierExists(Number(tierId));

    await this.validateTierAuthorization(user.id, eventId);

    const isPublished = await this.eventService.validateEvent(eventId);

    if (isPublished) {
      throw new HttpException('Tickets cannot be deleted for published events', 400);
    }

    await this.prismaService.$transaction([
      this.prismaService.tierBenefit.deleteMany({
        where: {
          tierId: tierId,
        },
      }),

      this.prismaService.tier.delete({
        where: {
          id: tierId,
        },
      }),
    ]);

    return {
      id: tierId,
      message: 'success',
    }
  }
}