import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const jwtKey = configService.get<string>('ACCESS_TOKEN_KEY');

    if (!jwtKey) {
      throw new Error('Access token key is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtKey
    });
  }

  async validate(payload) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}