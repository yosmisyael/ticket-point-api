import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [AuthModule],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
