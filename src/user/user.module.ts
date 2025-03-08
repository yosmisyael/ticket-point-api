import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailService } from '../mail/mail.service';
import { VerificationService } from '../verification/verification.service';

@Module({
  providers: [UserService, MailService, VerificationService],
  controllers: [UserController]
})
export class UserModule {}
