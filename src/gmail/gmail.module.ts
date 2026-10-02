import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { ClerkModule } from '../clerk/clerk.module';
import { Apikey } from '../common/configEnv/configEnv.service';
import { DatabaseModule } from '../database/database.module';
import { gmailRepository } from './repository/gmailRepo';
import { REPO_PORT } from './port/gmailRepoPort';
import { CLIENT_PORT } from './port/gmailClientPort';
import { gmailClient } from './client/gmailClient';

@Module({
  imports:[ClerkModule, DatabaseModule],
  providers: [GmailService, Apikey, {
    provide: REPO_PORT,
    useClass: gmailRepository
  },
{
      provide: CLIENT_PORT,
      inject: [Apikey],
      useFactory: (apiKey: Apikey) => {
        return new gmailClient(apiKey);
      },
    }
],
  controllers: [GmailController],
  exports: [GmailService],
})
export class GmailModule {}
