import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param, Patch,
  Post,
} from '@nestjs/common';
import {
  BookTicketRequestDto,
  BookTicketResponseDto,
  GenerateTicketResponseDto,
  ValidateTicketRequestDto,
} from './dto/ticket.dto';
import { TicketService } from './ticket.service';
import { WebResponse } from '../model/web.model';

@Controller('/api/tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/booking')
  @HttpCode(HttpStatus.CREATED)
  async bookTicket(@Body() bookingData: BookTicketRequestDto): Promise<WebResponse<BookTicketResponseDto>> {
    const result = await this.ticketService.bookTicket(bookingData);

    return {
      data: {
        message: 'success',
        bookingId: result.id,
      }
    };
  }

  @Post('/booking/:bookingId')
  @HttpCode(HttpStatus.OK)
  async generateTicket(@Param('bookingId') bookingId: number): Promise<WebResponse<GenerateTicketResponseDto>> {
    await this.ticketService.sendConfirmation(Number(bookingId));
    
    return {
      data: {
        message: 'success',
        bookingId: Number(bookingId)
      }
    }
  }

  @Patch('/booking/:bookId')
  @HttpCode(HttpStatus.OK)
  async validateTicket(
    @Param('bookId') bookingId: number,
    @Body() req: ValidateTicketRequestDto
  ): Promise<WebResponse<GenerateTicketResponseDto>> {
    await this.ticketService.validateTicket(Number(bookingId), req);

    return {
      data: {
        bookingId: Number(bookingId),
        message: 'success',
      }
    }
  }
}
