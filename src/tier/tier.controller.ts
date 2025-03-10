import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { CreateTierRequestDto, TierResponseDto } from './dto/tier.dto';
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
}