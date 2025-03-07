import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { generateOtp } from './util/otp.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VerificationService {
  private readonly minRequestIntervalMinutes = 1;
  private readonly maxExpirationMinutes = 15;
  private readonly saltRounds = 10;

  constructor(
    private prismaService: PrismaService
  ) {
  }

  async generateOtp(userId: number, size = 6): Promise<string> {
    const now = new Date();

    const recentToken = await this.prismaService.verification.count({
      where: {
        userId,
        createdAt:{
          gt: new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000),
        },
      }
    });

    if (recentToken) {
      throw new UnprocessableEntityException(
        'Please wait a minute before requesting a new token.',
      );
    }

    const otp: string = generateOtp(size);
    const hashedToken = await bcrypt.hash(otp, this.saltRounds);

    await this.prismaService.verification.deleteMany({
      where: {
        type: 'REGISTRATION',
        userId
      }
    });

    await this.prismaService.verification.create({
      data: {
        userId: userId,
        type: 'REGISTRATION',
        expiresAt: new Date(now.getTime() + this.maxExpirationMinutes),
        token: hashedToken,
      }
    });

    return otp;
  }
}
