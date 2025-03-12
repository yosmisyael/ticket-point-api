import {
  HttpException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserValidation } from './user.validation';
import { VerificationService } from '../verification/verification.service';
import { MailService } from '../mail/mail.service';
import {
  MailVerificationRequestDto,
  MailVerificationResponseDto,
  RegisterUserDto,
  UserResponseDto, UpdateUserDto, RequestOTPDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    private verificationService: VerificationService,
    private prismaService: PrismaService,
    private mailService: MailService,
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

  async register(request: RegisterUserDto): Promise<UserResponseDto> {
    const registerRequest = this.validationService.validate<RegisterUserDto>(
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

  async generateEmailVerification(user: UserResponseDto): Promise<void> {
    const otp: string = await this.verificationService.generateOtp(user.id);

    await this.mailService.sendMail({
      subject: 'TicketPoint - Your OTP Code',
      recipients: [
        {
          name: user.name ?? '',
          address: user.email,
        },
      ],
      html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #4DABF5; color: #ffffff; text-align: center; padding: 20px;">
                <img src="https://raw.githubusercontent.com/yosmisyael/ticket-point/refs/heads/main/public/ticket-point.png" alt="TicketPoint" style="max-width: 150px; height: auto;">
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
        `,
    });
  }

  async getUserById(userId: number): Promise<UserResponseDto> {
    const result = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!result) {
      throw new HttpException('User not found', 404);
    }

    return {
      id: result.id,
      name: result.name,
      email: result.email,
    };
  }

  async validateOTPRequest({ email, password }: RequestOTPDto): Promise<void> {
    await this.validationService.validate(UserValidation.REQUEST_OTP, { email, password });

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Email or password is wrong', 400);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Email or password is wrong', 400);
    }

    if (user.verifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    return this.generateEmailVerification({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async verifyEmail(
    request: MailVerificationRequestDto,
  ): Promise<MailVerificationResponseDto> {
    const invalidMessage = 'Invalid or expired OTP';

    const { id } = request;

    const user = await this.prismaService.user.findFirst({
      where: { id },
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
        id: user.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    });

    await this.mailService.sendMail({
      subject: 'TicketPoint - Welcome to TicketPoint',
      recipients: [{ name: user.name ?? '', address: user.email }],
      html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <!-- Header Section -->
              <div style="background-color: #4DABF5; color: #ffffff; text-align: center; padding: 20px;">
                <img src="https://raw.githubusercontent.com/yosmisyael/ticket-point/refs/heads/main/public/ticket-point.png" alt="TicketPoint" style="max-width: 150px; height: auto;">
                <h1 style="margin: 10px 0 0; font-size: 24px;">Welcome to TicketPoint!</h1>
              </div>
          
              <!-- Content Section -->
              <div style="padding: 20px; text-align: center;">
                <p style="font-size: 16px; color: #333333;">Hi there, ${user.name}</p>
                <p style="font-size: 16px; color: #333333;">Thank you for validating your account. You're all set to explore TicketPoint and enjoy seamless ticket management.</p>
                
                <!-- Button Linking to Your App -->
                <a href="" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #FFC400; text-decoration: none; border-radius: 8px;">
                  Go to TicketPoint
                </a>
          
                <p style="font-size: 14px; color: #666666;">If you have any questions, feel free to reach out to our support team.</p>
              </div>
          
              <!-- Footer Section -->
              <div style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666666;">
                <p style="margin: 0;">You're receiving this email because you signed up for TicketPoint.</p>
                <p style="margin: 0;">&copy; 2025 TicketPoint. All rights reserved.</p>
              </div>
            </div>
          </div>
        `,
    });

    return {
      message: 'Email verified successfully.',
    };
  }

  async update(
    userId: number,
    request: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updateRequest: UpdateUserDto =
      this.validationService.validate<UpdateUserDto>(
        UserValidation.UPDATE,
        request,
      );

    if (updateRequest.email) {
      const isAvailable: boolean = await this.verifyUniqueEmail(
        updateRequest.email,
      );

      if (!isAvailable) {
        throw new HttpException('Email is already taken', 400);
      }
    }

    if (updateRequest.password) {
      updateRequest.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: updateRequest,
    });

    return {
      id: userId,
      email: result.email,
      name: result.name,
    };
  }

  async deleteRefreshToken(id: number): Promise<boolean> {
    const result = await this.prismaService.authentication.deleteMany({
      where: {
        userId: id,
      },
    });

    if (result.count == 0) {
      throw new HttpException('An error occured wwhen trying to logout', 500);
    }

    return true;
  }
}
