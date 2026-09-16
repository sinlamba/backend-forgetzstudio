import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { Apikey } from '../common/configEnv/configEnv.service';
import { DatabaseModule } from '../database/database.module';
import { GmailModule } from '../gmail/gmail.module';

@Module({
    imports: [DatabaseModule, GmailModule],
  controllers: [GithubController],
  providers: [
    GithubService,
    Apikey,
  ],
})
export class GithubModule {}
