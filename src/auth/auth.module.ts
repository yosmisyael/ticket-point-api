import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthModule } from './jwt.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtAuthModule,
    ConfigModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}