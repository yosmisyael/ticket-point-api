import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  BookingTicketRequestDto,
  BookingTicketResponseDto,
  GenerateTicketResponseDto,
  AttendeeResponseDto,
  ValidateTicketRequestDto, AttendancesResponseDto, PaymentValidationDto,
} from './dto/ticket.dto';
import { TicketService } from './ticket.service';
import { WebResponse } from '../model/web.model';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../auth/model/request.model';

@Controller('/api/tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/payment-verification')
  @HttpCode(HttpStatus.OK)
  async validatePayment(@Body() payload: PaymentValidationDto) {
    await this.ticketService.validatePayment(payload);
  }

  @Post('/booking')
  @HttpCode(HttpStatus.CREATED)
  async bookTicket(@Body() bookingData: BookingTicketRequestDto): Promise<WebResponse<BookingTicketResponseDto>> {
    const result = await this.ticketService.bookTicket(bookingData);

    return {
      data: {
        message: 'success',
        bookingId: result.id,
      }
    };
  }

  @Patch('/booking/:bookingId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async validateTicket(
    @Param('bookingId') bookingId: number,
    @Body() payload: ValidateTicketRequestDto,
    @Req() { user }: RequestWithUser,
  ): Promise<WebResponse<GenerateTicketResponseDto>> {
    await this.ticketService.validateTicket(user, Number(bookingId), payload);

    return {
      data: {
        bookingId: Number(bookingId),
        message: 'success',
      }
    }
  }


  @Get('/:ticketId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async getAttendeeByCredentials(
    @Req() { user }: RequestWithUser,
    @Param(':/ticketId') ticketId: string,
  ): Promise<WebResponse<AttendeeResponseDto>> {
    console.log(ticketId)
    const result: AttendeeResponseDto  = await this.ticketService.getAttendeeByCredentials(user, ticketId);

    return {
      data: result
    }
  }

  @Get('/attendances/:eventId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async getAllEventAttendances(
    @Req() { user }: RequestWithUser,
    @Param('eventId') eventId: number,
  ): Promise<WebResponse<AttendancesResponseDto>> {
    const result = await  this.ticketService.getEventValidAttendances(user, Number(eventId));

    return {
      data: result
    };
  }
}
