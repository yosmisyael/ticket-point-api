import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import { LoginUserDto } from '../auth/dto/auth.dto';
import {
  MailVerificationRequestDto,
  MailVerificationResponseDto,
  RegisterUserDto,
  UserResponseDto,
} from './dto/user.dto';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserDto,
  ): Promise<WebResponse<UserResponseDto>> {
    const result = await this.userService.register(request);

    await this.userService.generateEmailVerification(result.id);

    return {
      data: result,
    };
  }

  @Post('/verify-email')
  @HttpCode(200)
  async verifyEmail(
    @Body() request: MailVerificationRequestDto,
  ): Promise<WebResponse<MailVerificationResponseDto>> {
    const result = await this.userService.verifyEmail(request);

    return {
      data: result,
    }
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserDto,
  ): Promise<WebResponse<UserResponseDto>> {
    const result = await this.userService.login(request);

    return {
      data: result,
    };
  }
}
