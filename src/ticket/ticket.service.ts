import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  BookTicketRequestDto,
  ValidateTicketRequestDto,
} from './dto/ticket.dto';
import { v4 as uuid } from 'uuid';
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import { ValidationService } from 'src/common/validation.service';
import { TicketValidation } from './ticket.validation';
import { MailService } from '../mail/mail.service';
import { join } from 'path';
import { Event, Prisma } from '@prisma/client';

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

  async generateTicket(credentials: string, eventCtx): Promise<string> {
    const storageDir = join(__dirname, '../../', 'storage');
    await fs.ensureDir(storageDir);

    const timestamp = new Date().getTime();
    const qrImagePath = join(storageDir, `qr-${timestamp}.png`);
    const pdfPath = join(storageDir, `ticket-${timestamp}.pdf`);

    await QRCode.toFile(qrImagePath, credentials, {
      errorCorrectionLevel: 'H',
      width: 200,
      margin: 1
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

        doc.fontSize(12).font('Helvetica').text(`Date: ${eventCtx.startDate}`, {
          align: 'center',
        });
        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica').text(`Venue: ${eventCtx.location.venue}`, {
          align: 'center',
        });
        doc.moveDown(0.2);
        doc.fontSize(12).font('Helvetica').text(`Location: ${eventCtx.location.address}`, {
          align: 'center',
        });
        doc.moveDown(1);

        doc.moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();
        doc.moveDown(1);

        // Add QR code image
        doc.image(qrImagePath, {
          fit: [200, 200],
          align: 'center',
          valign: 'center',
        });
        doc.moveDown(16);

        doc.fontSize(10).font('Helvetica').text('Scan this QR code at the event entrance:', {
          align: 'center',
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text('1. Ensure your device screen brightness is set to maximum.', {
          align: 'center',
        });
        doc.fontSize(10).font('Helvetica').text('2. Present the QR code for scanning.', {
          align: 'center',
        });
        doc.moveDown(1);

        doc.fontSize(8).font('Helvetica').text('© 2025 TicketPoint. All rights reserved.', {
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

  async sendConfirmation(bookId: number) {
    const data = await this.prismaService.ticket.findFirst({
      where: {
        id: bookId,
      },
    });

    if (!data) {
      throw new HttpException('Booking data is invalid', HttpStatus.NOT_FOUND);
    }

    const isBilling = true;

    if (!isBilling) {
      throw new HttpException('User has not made ticket payment', 400);
    }

    const ticketCredentials: string = uuid();

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
    })

    const generatedTicketPath: string = await this.generateTicket(ticketCredentials, event);

    await this.mailService.sendMail({
      subject: 'TicketPoint - Your OTP Code',
      recipients: [{ name: data.attendee ?? '', address: data.email }],
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
        }
      ]
    });

    await this.prismaService.ticket.update({
      where: {
        id: bookId
      },
      data: {
        credential: ticketCredentials,
      }
    })
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
