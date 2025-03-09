import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import {
  MailVerificationRequestDto,
  MailVerificationResponseDto,
  RegisterUserDto,
  UserResponseDto,
} from './dto/user.dto';
import { LocalGuard } from '../auth/guards/local.guard';
import { Request } from 'express';

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
  @UseGuards(LocalGuard)
  @HttpCode(200)
  async login(@Req() req: Request): Promise<WebResponse<UserResponseDto>> {
    return {
      data: req.user as UserResponseDto,
    };
  }
}
