import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@Controller('/api/organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  async createOrganization(
    @Body() payload: CreateOrganizationDto,
  ) {
    const result = await this.organizationService.createOrganization(payload);

    return {
      data: result,
    }
  }

  @Patch('/:id')
  async updateOrganization(
    @Param('id') id: number,
    @Body() payload: UpdateOrganizationDto,
  ) {
    const result = await this.organizationService.updateOrganization(id, payload);

    return {
      data: result,
    }
  }

  @Delete('/:id')
  async deleteOrganization(@Param('id') id: number) {
    const result = await this.organizationService.deleteOrganization(id);

    return {
      data: result,
    }
  }

  @Get('/:id')
  async getOrganization(@Param('id') id: number) {
    const result = await this.organizationService.getOrganization(id);

    return {
      data: result,
    }
  }
}
