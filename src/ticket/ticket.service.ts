import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  AttendeeResponseDto,
  AttendancesResponseDto,
  BookingTicketRequestDto,
  ValidateTicketRequestDto, PaymentValidationDto,
} from './dto/ticket.dto';
import { v4 as uuid } from 'uuid';
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import { ValidationService } from 'src/common/validation.service';
import { TicketValidation } from './ticket.validation';
import { MailService } from '../mail/mail.service';
import { join } from 'path';
import { UserPayload } from '../auth/model/request.model';

@Injectable()
export class TicketService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly mailService: MailService,
  ) {}

  async bookTicket(request: BookingTicketRequestDto): Promise<{ id: number }> {
    const validated: BookingTicketRequestDto = await this.validationService.validate(
      TicketValidation.BOOKING,
      request,
    );

    return this.prismaService.ticket.create({
      data: {
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        organization: validated.organization,
        position: validated.position,
        tierId: validated.tierId,
        orderId: validated.orderId,
      },
      select: {
        id: true,
      },
    });
  }

  async generateTicket(credentials: string, eventCtx): Promise<string> {
    const storageDir = join(__dirname, '../../', 'storage');
    await fs.ensureDir(storageDir);

    const timestamp = new Date().getTime();
    const qrImagePath = join(storageDir, `qr-${timestamp}.png`);
    const pdfPath = join(storageDir, `ticket-${timestamp}.pdf`);

    await QRCode.toFile(qrImagePath, credentials, {
      errorCorrectionLevel: 'H',
      width: 200,
      margin: 1,
    });

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A5',
          margin: 20,
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        doc.fontSize(18).font('Helvetica-Bold').text(eventCtx.title, {
          align: 'center',
        });
        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica').text(`Date: ${new Date(eventCtx.startDate).toLocaleString('en-US', {
          timeZone: 'Asia/Jakarta',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'longOffset'
        })}`, {
          align: 'center',
        });
        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Venue: ${eventCtx.location.venue}`, {
            align: 'center',
          });
        doc.moveDown(0.2);
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Location: ${eventCtx.location.address}`, {
            align: 'center',
          });
        doc.moveDown(1);

        doc
          .moveTo(20, doc.y)
          .lineTo(doc.page.width - 20, doc.y)
          .stroke();
        doc.moveDown(1);
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

        const qrWidth = 200;
        const qrHeight = 200;

        const x = (pageWidth - qrWidth) / 2 + doc.page.margins.left;
        const y = (pageHeight - qrHeight) / 3 + doc.page.margins.top;

        doc.image(qrImagePath,x,y, {
          fit: [200, 200],
        });
        doc.moveDown(16);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Ticket ID: ${credentials}`, {
            align: 'center',
          });
        doc.moveDown(5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Scan this QR code at the event entrance:', {
            align: 'center',
          });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('1. Ensure your device screen brightness is set to maximum.', {
            align: 'center',
          });
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('2. Present the QR code for scanning.', {
            align: 'center',
          });
        doc.moveDown(1);

        doc
          .fontSize(8)
          .font('Helvetica')
          .text('© 2025 TicketPoint. All rights reserved.', {
            align: 'center',
          });

        doc.end();

        stream.on('finish', () => {
          resolve(pdfPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async sendConfirmation(bookingId: number) {
    const data = await this.prismaService.ticket.findFirst({
      where: {
        id: bookingId,
      },
    });

    if (!data) {
      throw new HttpException('Booking data is invalid', HttpStatus.NOT_FOUND);
    }

    const ticketCredentials: string = data.credential as string;

    const event = await this.prismaService.event.findFirst({
      where: {
        tiers: {
          some: {
            id: data.tierId as number,
          },
        },
      },
      include: {
        tiers: true,
        location: true,
      },
    });

    const generatedTicketPath: string = await this.generateTicket(
      ticketCredentials,
      event,
    );

    await this.mailService.sendMail({
      subject: 'TicketPoint - Your Ticket Order',
      recipients: [
        {
          name: `${data.firstName} ${data.lastName}`,
          address: data.email,
        },
      ],
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #4DABF5; color: #ffffff; text-align: center; padding: 20px;">
              <img src="https://raw.githubusercontent.com/yosmisyael/ticket-point/refs/heads/main/public/ticket-point.png" alt="TicketPoint" style="max-width: 150px; height: auto;">
              <h1 style="margin: 10px 0 0; font-size: 24px;">Your Ticket Order Confirmation</h1>
            </div>
            <div style="padding: 20px; text-align: center;">
              <p style="font-size: 16px; color: #333333;">Thank you for purchasing your ticket with TicketPoint! Below are the details of your order and instructions on how to use your ticket:</p>
              <p style="font-size: 16px; color: #333333; font-weight: bold;">Instructions:</p>
              <ul style="text-align: left; font-size: 14px; color: #666666; margin: 20px 0; padding-left: 20px;">
                <li>Your ticket QR code is attached to this email as a PDF file. You can download and save it for offline use.</li>
                <li>Present the QR code at the event entrance for scanning. Ensure your device screen brightness is set to maximum for easy scanning.</li>
                <li>If you prefer a printed copy, you can print the attached PDF and bring it to the event.</li>
                <li>Do not share your QR code with anyone. It is unique to your ticket and grants access to the event.</li>
              </ul>
        
              <p style="font-size: 14px; color: #666666;">If you have any questions or need assistance, please contact our support team at <a href="mailto:support@ticketpoint.com" style="color: #4DABF5;">support@ticketpoint.com</a>.</p>
            </div>
            <div style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666666;">
              <p style="margin: 0;">&copy; 2025 TicketPoint. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          path: generatedTicketPath,
        },
      ],
    });
  }

  async validateTicket(user: UserPayload, bookingId: number, request: ValidateTicketRequestDto) {
    const validatedData = await this.validationService.validate(
      TicketValidation.VALIDATE,
      request,
    );

    const result = await this.prismaService.ticket.findUnique({
      where: {
        credential: validatedData.credential,
        id: bookingId,
      },
      select: {
        credential: true,
        tier: {
          select: {
            event: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new HttpException('Invalid ticket credentials', 400);
    }

    if (user.id !== result.tier?.event.ownerId) {
      throw new HttpException("Credential doesn't match", 400);
    }

    if (result.credential !== validatedData.credential) {
      throw new HttpException('Invalid ticket credentials', 400);
    }

    await this.prismaService.ticket.update({
      where: {
        id: bookingId,
      },
      data: {
        isCheckin: true,
        checkinDate: new Date().toISOString(),
      },
    });
  }

  async getEventValidAttendances(
    user: UserPayload,
    eventId: number,
  ): Promise<AttendancesResponseDto> {
    const authorizedOwner = await this.prismaService.event.findFirst({
      where: {
        ownerId: user.id,
      },
      select: {
        ownerId: true,
      },
    });

    if (!authorizedOwner) {
      throw new HttpException('User not found', 404);
    }

    if (authorizedOwner.ownerId !== user.id) {
      throw new UnauthorizedException(
        'You do not have permission to access this resource',
      );
    }

    const data = await this.prismaService.ticket.findMany({
      where: {
        tier: {
          eventId,
        },
      },
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        tier: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      message: 'success',
      attendances: data as AttendeeResponseDto[],
    };
  }

  async getAttendeeByCredentials(
    user: UserPayload,
    credentials: string,
  ): Promise<AttendeeResponseDto> {
    const data = await this.prismaService.ticket.findFirst({
      where: {
        credential: credentials,
      },
      select: {
        firstName: true,
        lastName: true,
        organization: true,
        position: true,
        email: true,
        phone: true,
        tier: {
          select: {
            name: true,
            event: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!data) {
      throw new HttpException('Not found data', 404);
    }

    if (data.tier?.event.ownerId !== user.id) {
      throw new UnauthorizedException('Cannot access unauthorized resource');
    }

    return {
      firstName: data.firstName,
      lastName: data.lastName,
      organization: data.organization,
      position: data.position,
      email: data.email,
      phone: data.phone,
      tier: data.tier ? { name: data.tier.name } : undefined,
    };
  }

  async validatePayment(request: PaymentValidationDto) {
    const validated: PaymentValidationDto = await this.validationService.validate(TicketValidation.PAYMENT_VALIDATION, request);

    if (validated.fraud_status !== 'accept') {
      throw new HttpException('Payment validation failed', 400);
    }

    if ((validated.transaction_status !== 'settlement') && (validated.transaction_status !== 'capture')) {
      throw new HttpException('Payment validation failed', 400);
    }

    const credential: string = uuid();

    const result = await this.prismaService.ticket.update({
      where: {
        orderId: validated.order_id as string,
      },
      data: {
        transactionType: validated.transaction_type,
        transactionStatus: true,
        transactionTime: validated.transaction_time,
        fraudStatus: validated.fraud_status,
        credential,
      },
      select: {
        id: true,
      },
    });

    await this.sendConfirmation(result.id);
  }
}
