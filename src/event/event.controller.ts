import { Body, Controller, HttpCode, Post } from '@nestjs/common';
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
}