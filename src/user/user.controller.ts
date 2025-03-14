import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import {
  MailVerificationRequestDto,
  MailVerificationResponseDto,
  RegisterUserDto,
  RequestOTPDto,
  UserResponseDto,
} from './dto/user.dto';
import { LocalGuard } from '../auth/guards/local.guard';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '@prisma/client';
import { RequestWithUser } from '../auth/model/request.model';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/current')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async getCurrentUser(@Req() req: RequestWithUser) {
    return await this.userService.getUserById(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterUserDto,
  ): Promise<WebResponse<UserResponseDto>> {
    const result = await this.userService.register(request);

    await this.userService.generateEmailVerification(result);

    return {
      data: result,
    };
  }

  @Post('/request-token')
  @HttpCode(HttpStatus.OK)
  async requestValidationToken(@Body() req: RequestOTPDto) {
    await this.userService.validateOTPRequest(req);

    return {
      data: {
        message: 'success',
      },
    };
  }

  @Post('/verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() request: MailVerificationRequestDto,
  ): Promise<WebResponse<MailVerificationResponseDto>> {
    const result = await this.userService.verifyEmail(request);

    return {
      data: result,
    };
  }

  @Post('/login')
  @UseGuards(LocalGuard)
  @HttpCode(200)
  async login(@Req() req: Request): Promise<WebResponse<UserResponseDto>> {
    return {
      data: req.user as UserResponseDto,
    };
  }

  @Patch('/update')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async update(@Req() req: Request): Promise<WebResponse<UserResponseDto>> {
    const { id } = req.user as User;

    const result: UserResponseDto = await this.userService.update(id, req.body);

    return {
      data: result,
    };
  }

  @Delete('/logout')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async logout(@Req() req: Request) {
    const { id } = req.user as User;

    await this.userService.deleteRefreshToken(id);

    return {
      data: {
        message: 'Logged out successfully',
      },
    };
  }
}
