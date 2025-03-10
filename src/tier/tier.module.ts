import { Module } from '@nestjs/common';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { AuthModule } from '../auth/auth.module';
import { EventService } from '../event/event.service';

@Module({
  imports: [AuthModule],
  providers: [TierService, EventService],
  controllers: [TierController],
})
export class TierModule {}
