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
        bookId: result.id,
      }
    };
  }

  @Post('/book/:bookId')
  @HttpCode(HttpStatus.OK)
  async generateTicket(@Param('bookId') bookId: number): Promise<WebResponse<GenerateTicketResponseDto>> {
    await this.ticketService.generateTicket(Number(bookId));
    
    return {
      data: {
        message: 'success',
      }
    }
  }

  @Patch('/book/:bookId')
  @HttpCode(HttpStatus.OK)
  async validateTicket(
    @Param('bookId') bookId: number,
    @Body() req: ValidateTicketRequestDto
  ): Promise<WebResponse<GenerateTicketResponseDto>> {
    await this.ticketService.validateTicket(Number(bookId), req);

    return {
      data: {
        message: 'success',
      }
    }
  }
}
