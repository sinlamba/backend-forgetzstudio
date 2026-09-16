import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { ClerkModule } from '../clerk/clerk.module';
import { Apikey } from '../common/configEnv/configEnv.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:[ClerkModule, DatabaseModule],
  providers: [GmailService, Apikey],
  controllers: [GmailController],
  exports: [GmailService],
})
export class GmailModule {}
