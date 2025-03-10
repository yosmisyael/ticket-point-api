import { Module } from '@nestjs/common';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [AuthModule, EventModule],
  providers: [TierService],
  controllers: [TierController],
})
export class TierModule {}
