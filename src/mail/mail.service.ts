import { Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/mail.dto';

@Injectable()
export class MailService {
  private mailTransport: Transporter;

  constructor(private configService: ConfigService) {
    this.mailTransport = createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: Number(this.configService.get('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(data: SendEmailDto): Promise<{ success: boolean } | null> {
    const { sender, recipients, subject, html, text } = data;

    const mailOptions: SendMailOptions = {
      from:  sender ?? {
        name: this.configService.get('MAIL_SENDER_NAME_DEFAULT') || '',
        address: this.configService.get('MAIL_SENDER_DEFAULT') || '',
      },
      to: recipients,
      subject,
      html,
      text,
    };

    try {
      await this.mailTransport.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      return null;
    }
  }
}
