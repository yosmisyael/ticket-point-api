export class RegisterUserDto {
  email: string;
  name: string;
  password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  token?: string;
}

export class MailVerificationRequestDto {
  userId: number;
  token: string;
}

export class MailVerificationResponseDto {
  message: string;
}