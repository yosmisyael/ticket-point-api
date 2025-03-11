export class AuthRequestDto {
  email: string;
  password: string;
}

export class AuthDto {
  sub?: number;
  email: string;
  name: string;
}