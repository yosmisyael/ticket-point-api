import { HttpException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
  MailVerificationRequest, MailVerificationResponse,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserValidation } from './user.validation';
import { VerificationService } from '../verification/verification.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
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
      id: user.id,
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

    await this.mailSerivce.sendMail({
      subject: 'TicketPoint - Your OTP Code',
      recipients: [{ name: user.name ?? '', address: user.email }],
      html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #2196F3; color: #ffffff; text-align: center; padding: 20px;">
                <img src="" alt="Your App Logo" style="max-width: 150px; height: auto;">
                <h1 style="margin: 10px 0 0; font-size: 24px;">Your OTP Code</h1>
              </div>
              <div style="padding: 20px; text-align: center;">
                <p style="font-size: 16px; color: #333333;">Please use the following OTP code to verify your account:</p>
                <div style="font-size: 32px; font-weight: bold; color: #000; margin: 20px 0; background-color: #FFC400; padding: 10px; border-radius: 8px; display: inline-block;">
                  ${otp}
                </div>
                <p style="font-size: 14px; color: #666666;">This code is valid for 15 minutes. Do not share it with anyone.</p>
              </div>
              <div style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666666;">
                <p style="margin: 0;">If you did not request this OTP, please ignore this email.</p>
                <p style="margin: 0;">&copy; 2025 TicketPoint. All rights reserved.</p>
              </div>
            </div>
          </div>
        `
    });
  }

  async verifyEmail(request: MailVerificationRequest): Promise<MailVerificationResponse> {
    const invalidMessage = 'Invalid or expired OTP';

    const user = await this.prismaService.user.findFirst({
      where: {
        id: request.userId,
      }
    });

    if (!user) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    if (user.verifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const isValid: Boolean = await this.verificationService.validateOtp(
      user.id,
      request.token,
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

    return {
      message: 'Email verified successfully.',
    };
  }
}
