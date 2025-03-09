import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport';
import { AuthService } from '../auth.service';

export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<string> {
    return await this.authService.validateUser({ email, password });
  }
}