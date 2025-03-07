import { HttpException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserValidation } from './user.validation';
import { VerificationService } from '../verification/verification.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private verificationService: VerificationService,
    private prismaService: PrismaService,
    private mailSerivce: MailService
  ) {}

  async verifyUniqueEmail(email: string, userId?: number): Promise<boolean> {
    const whereClause: Prisma.UserWhereInput = {
      email,
    };

    if (userId) {
      whereClause.NOT = { id: userId };
    }

    const countUsernames = await this.prismaService.user.count({
      where: whereClause,
    });

    return countUsernames === 0;
  }

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`[REGISTER] ${JSON.stringify(request)}`);
    const registerRequest =
      this.validationService.validate<RegisterUserRequest>(
        UserValidation.REGISTER,
        request,
      );

    const isAvailable: boolean = await this.verifyUniqueEmail(
      registerRequest.email,
    );

    if (!isAvailable) {
      throw new HttpException('Email is already in use.', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      email: user.email,
      name: user.name,
    };
  }

  async generateEmailVerification(userId: number) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const otp = await this.verificationService.generateOtp(user.id);

    await this.mailSerivce.sendEmail({
      subject: 'MyApp - Account Verification',
      recipients: [{ name: user.name ?? '', address: user.email }],
      html: `<p>Hi${user.name ? ' ' + user.name : ''},</p><p>You may verify your MyApp account using the following OTP: <br /><span style="font-size:24px; font-weight: 700;">${otp}</span></p><p>Regards,<br />MyApp</p>`,
    });
  }

  async verifyEmail(userId: number, token: string) {
    const invalidMessage = 'Invalid or expired OTP';

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    if (user.verifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const isValid = await this.verificationService.validateOtp(
      user.id,
      token,
    );

    if (!isValid) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    await this.prismaService.user.update({
      where: {
        id: user.id
      },
      data: {
        verifiedAt: new Date(),
      }
    });

    return true;
  }
}
