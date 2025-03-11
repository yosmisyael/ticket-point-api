import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDTO } from './dto/mail.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService, private readonly  mailerService: MailerService) {}

  async sendMail(data : MailDTO): Promise<{ success: boolean } | null> {
    const { recipients, subject, html } = data;

    try {
      await this.mailerService.sendMail({
        to: recipients,
        from: `"${this.configService.get('APP_NAME')}" <no-reply@ticketpoint.site>`,
        subject,
        html,
        attachments: data.attachments ? data.attachments : [],
      });

      return {
        success: true,
      };

    } catch (error) {

      return {
        success: false,
      };

    }
  }
}
