import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventRequestDto, UpdateEventRequestDto } from './dto/event.dto';
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

  @Patch('/:id')
  @HttpCode(200)
  async updateEvent(
    @Param('id') id: number,
    @Body() req: UpdateEventRequestDto
  ) {
    const result = await this.eventService.updateEvent(Number(id), req);

    return {
      message: 'success',
      data: result,
    }
  }

  @Delete('/:id')
  @HttpCode(200)
  async deleteEvent(@Param('id') id: number) {
    await this.eventService.deleteEvent(Number(id));

    return {
      data: {
        message: 'success',
      },
    };
  }
}