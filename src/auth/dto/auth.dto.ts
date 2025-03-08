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