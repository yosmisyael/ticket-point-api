import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { VerificationModule } from './verification/verification.module';
import { EventModule } from './event/event.module';
import { TierModule } from './tier/tier.module';
import { FileModule } from './file/file.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    MailModule,
    VerificationModule,
    EventModule,
    TierModule,
    FileModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
