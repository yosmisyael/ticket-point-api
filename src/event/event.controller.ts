import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus,
  Param,
  Patch,
  Post,
  Query, Req,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventRequestDto, EventResponseDto, UpdateEventRequestDto } from './dto/event.dto';
import { WebResponse } from '../model/web.model';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RequestWithUser } from '../auth/model/request.model';

@Controller('/api/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async createEvent(
    @Body() payload: CreateEventRequestDto,
    @Req() { user }: RequestWithUser,
  ): Promise<WebResponse<EventResponseDto>> {
    const result: EventResponseDto = await this.eventService.createEvent(
      user,
      payload,
    );

    return {
      data: result,
    };
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async searchEvent(
    @Query('title') title: string,
    @Query('category') category: string,
    @Query('organizer') organizer: number,
    @Query('location') location: string,
    @Query('time') time: string,
  ) {
    const result = await this.eventService.searchEvents({
      title,
      category,
      ownerId: Number(organizer),
      location,
      time,
    });

    return {
      message: 'success',
      data: result,
    };
  }


  @Get('/owner/:ownerId')
  @HttpCode(HttpStatus.OK)
  async getEventByOwner(@Param('ownerId') id: number) {
    const result = await this.eventService.getEventByOwnerId(Number(id));

    return {
      message: 'success',
      data: result,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getEvent(@Param('id') id: number) {
    const result = await this.eventService.getEventById(Number(id));

    return {
      data: result,
    };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async updateEvent(
    @Req() { user }: RequestWithUser,
    @Param('id') id: number,
    @Body() payload: UpdateEventRequestDto,
  ): Promise<WebResponse<EventResponseDto>> {
    const result = await this.eventService.updateEvent(Number(id), user, payload);

    return {
      data: result,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async deleteEvent(
    @Param('id') id: number,
    @Req() { user }: RequestWithUser,
  ): Promise<WebResponse<EventResponseDto>> {
    const data = await this.eventService.deleteEvent(Number(id), user);

    return {
      data,
    };
  }
}