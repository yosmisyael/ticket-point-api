import { Body, Controller, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateTierRequestDto, GetAllTiersDto, TierResponseDto, UpdateTierRequestDto } from './dto/tier.dto';
import { TierService } from './tier.service';
import { WebResponse } from '../model/web.model';
import { Tier } from '@prisma/client';

@Controller('/api/events/:eventId')
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Get('/tier')
  @HttpCode(200)
  async getTiersByEventId(eventId: number): Promise<WebResponse<GetAllTiersDto>> {
    const result: Tier[] = await this.tierService.getTiersByEventId(eventId);
    
    return {
      data: {
        message: 'success',
        tiers: result,
      },
    };
  }
  
  @Post('/tier')
  @HttpCode(200)
  async createTier(
    @Param('eventId') eventId: number,
    @Body() req: CreateTierRequestDto
  ): Promise<WebResponse<TierResponseDto>> {
    const result = await this.tierService.createTier(Number(eventId), req);
    
    return {
      data: result,
    }
  }

  @Patch('/tier/:tierId')
  @HttpCode(200)
  async updateTiers(
    @Param('eventId') eventId: number, 
    @Param('tierId') tierId: number, 
    @Body() req: UpdateTierRequestDto
  ):Promise<WebResponse<TierResponseDto>> {
    const result = await this.tierService.updateTier(Number(eventId), Number(tierId), req);

    return {
      data: result,
    }
  }
}