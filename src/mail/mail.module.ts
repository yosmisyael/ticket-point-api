import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('GMAIL_HOST'),
          secure: false,
          port: configService.get('GMAIL_PORT'),
          auth: {
            user: configService.get('GMAIL_ADDRESS'),
            pass: configService.get('GMAIL_APP_PASSWORD'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
