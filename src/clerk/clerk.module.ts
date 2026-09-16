import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkController } from './clerk.controller';
import { Apikey } from '../common/configEnv/configEnv.service';

@Module({
  providers: [ClerkService , Apikey],
  controllers: [ClerkController],
  exports:[ClerkService]
})
export class ClerkModule {}
