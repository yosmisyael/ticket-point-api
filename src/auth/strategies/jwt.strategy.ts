import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
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

  validate(payload: JwtPayload): JwtPayload {
    console.log('HEY THIS IS FROM INSIDE JWT STRATEGY');
    return payload;
  }
}