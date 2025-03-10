import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailService } from '../mail/mail.service';
import { VerificationService } from '../verification/verification.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UserService, MailService, VerificationService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
