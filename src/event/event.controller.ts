import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventRequestDto } from './dto/event.dto';
import { WebResponse } from '../model/web.model';

@Controller('/api/events')
export class EventController {
  constructor(
    private readonly eventService: EventService) {}

  @Post()
  @HttpCode(200)
  async createEvent(@Body() req: CreateEventRequestDto): Promise<WebResponse<{ message: string }>> {
    const result: { message: string } = await this.eventService.createEvent(req);

    return {
      data: result,
    };
  }

  @Get('/search')
  @HttpCode(200)
  async searchEvent(
    @Query('title') title: string,
    @Query('category') category: string,
    @Query('organizer') organizer: number,
  ) {
    const result = await this.eventService.searchEvents({
      title,
      category,
      ownerId: Number(organizer)
    });

    return {
      data: result,
    }
  }

  @Get('/:id')
  @HttpCode(200)
  async getEvent(@Param('id') id: number) {
    const result = await this.eventService.getEventById(Number(id));

    return {
      data: result,
    }
  }
}