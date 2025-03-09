import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto, AuthRequestDto } from './dto/auth.dto';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser({ email, password }: AuthRequestDto): Promise<UserResponseDto> {
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

    if (!user.verifiedAt) {
      throw new UnauthorizedException('You should verify your email first');
    }

    const jwtPayload: AuthDto = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    const token = this.jwtService.sign(jwtPayload);

    await this.prismaService.authentication.create({
      data: {
        userId: user.id,
        token: token,
      }
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token: token,
    };
  }
}