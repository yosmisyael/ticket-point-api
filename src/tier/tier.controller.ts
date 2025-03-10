import { Body, Controller, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateTierRequestDto, TierResponseDto, UpdateTierRequestDto } from './dto/tier.dto';
import { TierService } from './tier.service';
import { WebResponse } from '../model/web.model';

@Controller('/api/events/:eventId')
export class TierController {
  constructor(private readonly tierService: TierService) {}

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