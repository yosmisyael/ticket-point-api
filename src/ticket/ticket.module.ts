import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    AuthModule,
    MailModule,
  ],
  providers: [TicketService],
  controllers: [TicketController]
})
export class TicketModule {}
