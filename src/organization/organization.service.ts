import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { CreateOrganizationDto, OrganizationResponseDto, UpdateOrganizationDto } from './dto/organization.dto';
import { OrganizationValidation } from './organization.validation';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService
  ) {}

  async createOrganization(payload: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    const validated = this.validationService.validate(OrganizationValidation.CREATE, payload);

    const result = await this.prismaService.organization.create({
      data: validated,
      select: {
        id: true,
      }
    });

    return {
      id: result.id,
      message: 'success'
    }
  }

  async updateOrganization(
    id: number,
    payload: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const validated = this.validationService.validate(OrganizationValidation.UDPATE, payload);

    const organization = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new HttpException('Organization not found', 404);
    }

    const result = await this.prismaService.organization.update({
      where: { id },
      data: validated,
      select: {
        id: true,
      }
    });

    return {
      id: result.id,
      message: 'success'
    }
  }

  async deleteOrganization(id: number): Promise<OrganizationResponseDto> {
    const organization = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new HttpException('Organization not found', 404);
    }

    const result = await this.prismaService.organization.delete({
      where: { id },
    });

    return {
      id: result.id,
      message: 'success'
    }
  }

  async getOrganization(id: number) {
    const organization = await this.prismaService.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            events: true,
          },
        },
      },
    });

    if (!organization) {
      throw new HttpException('Organization not found', 404);
    }

    return organization;
  }
}
