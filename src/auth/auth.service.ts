import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto, AuthRequestDto } from './dto/auth.dto';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async validateUser({ email, password }: AuthRequestDto): Promise<AuthDto> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    return {
      email: user.email,
      name: user.name,
    }
  }
}