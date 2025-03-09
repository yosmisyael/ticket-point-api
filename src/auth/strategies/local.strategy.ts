import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    console.log('inside constructor local strategy')
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<string> {
    console.log('inside validate local strategy');
    return await this.authService.validateUser({ email, password });
  }
}