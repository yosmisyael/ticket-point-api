export class RegisterUserDto {
  email: string;
  name: string;
  password: string;
}

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  token?: string;
  profileUrl?: string | null;
  organization?: string;
  message?: string;
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  organizationId?: number;
  profileUrl?: string;
}

export class MailVerificationRequestDto {
  id: number;
  token: string;
}

export class MailVerificationResponseDto {
  message: string;
}

export class RequestOTPDto {
  email: string;
}