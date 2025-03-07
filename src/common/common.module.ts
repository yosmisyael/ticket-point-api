import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
