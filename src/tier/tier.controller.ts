import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTierRequestDto, GetAllTiersDto, TierResponseDto, UpdateTierRequestDto } from './dto/tier.dto';
import { TierService } from './tier.service';
import { WebResponse } from '../model/web.model';
import { Tier } from '@prisma/client';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../auth/model/request.model';

@Controller('/api/events/:eventId')
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Get('/tier')
  @HttpCode(HttpStatus.OK)
  async getTiersByEventId(@Param('eventId') eventId: number): Promise<WebResponse<GetAllTiersDto>> {
    const result: Tier[] = await this.tierService.getTiersByEventId(Number(eventId));
    
    return {
      data: {
        message: 'success',
        tiers: result,
      },
    };
  }
  
  @Post('/tier')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async createTier(
    @Req() { user }: RequestWithUser,
    @Param('eventId') eventId: number,
    @Body() payload: CreateTierRequestDto
  ): Promise<WebResponse<TierResponseDto>> {
    const result = await this.tierService.createTier(user, Number(eventId), payload);
    
    return {
      data: result,
    }
  }

  @Patch('/tier/:tierId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async updateTiers(
    @Req() { user }: RequestWithUser,
    @Param('eventId') eventId: number, 
    @Param('tierId') tierId: number, 
    @Body() payload: UpdateTierRequestDto
  ):Promise<WebResponse<TierResponseDto>> {
    const result = await this.tierService.updateTier(user, Number(eventId), Number(tierId), payload);

    return {
      data: result,
    }
  }

  @Delete('/tier/:tierId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async deleteTier(
    @Req() { user }: RequestWithUser,
    @Param('eventId') eventId: number,
    @Param('tierId') tierId: number
  ): Promise<WebResponse<TierResponseDto>> {
    const result = await this.tierService.deleteTier(user, Number(eventId), Number(tierId));

    return {
      data: result,
    };
  }
}