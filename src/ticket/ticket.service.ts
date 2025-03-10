import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  BookTicketRequestDto,
  ValidateTicketRequestDto,
} from './dto/ticket.dto';
import { v4 as uuid } from 'uuid';
import * as QRCode from 'qrcode';
import { ValidationService } from 'src/common/validation.service';
import { TicketValidation } from './ticket.validation';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly mailService: MailService,
  ) {}

  async bookTicket(request: BookTicketRequestDto): Promise<{ id: number }> {
    const validatedData = await this.validationService.validate(TicketValidation.BOOK, request);

    return this.prismaService.ticket.create({
      data: {
        email: validatedData.email,
        attendee: validatedData.attendee,
        phone: validatedData.phone,
        tierId: validatedData.tierId
      },
      select: {
        id: true,
      }
    });
  }

  async generateTicket(bookId: number) {
    const data = await this.prismaService.ticket.findFirst({
      where: {
        id: bookId,
      },
    });

    if (!data) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const isBilling = true;

    if (!isBilling) {
      throw new HttpException('User has not made ticket payment', 400);
    }

    const ticketId: string = uuid();

    const ticketQR: string = await QRCode.toDataURL(ticketId);

    await this.mailService.sendMail({
      subject: 'TicketPoint - Your OTP Code',
      recipients: [{ name: data.attendee ?? '', address: data.email }],
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #2196F3; color: #ffffff; text-align: center; padding: 20px;">
            <img src="" alt="Your App Logo" style="max-width: 150px; height: auto;">
            <h1 style="margin: 10px 0 0; font-size: 24px;">Your Ticket</h1>
          </div>
          <div style="padding: 20px; text-align: center;">
            <p style="font-size: 16px; color: #333333;">Please use the following ticket code to verify your validation during the event</p>
            <p style="font-size: 16px; color: #333333;">Scan the QR code below:</p>
            <div style="font-size: 32px; font-weight: bold; color: #000; margin: 20px 0; background-color: #FFC400; padding: 10px; border-radius: 8px; display: inline-block;">
              <img src="${ticketQR}" alt="QR Code" style="max-width: 200px; height: auto; margin: 20px 0;">
            </div>
            <p style="font-size: 14px; color: #666666;">Do not share it with anyone.</p>
          </div>
          <div style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666666;">
            <p style="margin: 0;">&copy; 2025 TicketPoint. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    });
  }


  async validateTicket(bookId: number, request: ValidateTicketRequestDto) {
    const validatedData = await this.validationService.validate(TicketValidation.VALIDATE, request);

    const result = await this.prismaService.ticket.findUnique({
      where: {
        credential: validatedData.credential,
        id: bookId,
      },
    });
    
    if (!result) {
      throw new HttpException('Invalid ticket credentials', 400);
    }
    
    if (result.credential !== validatedData.credential) {
      throw new HttpException('Invalid ticket credentials', 400);
    }
    
    await this.prismaService.ticket.update({
      where: {
        id: bookId,
      },
      data: {
        isCheckin: true,
        checkinDate: new Date().toISOString(),
      }
    });
  }
}
