import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { Apikey } from '../common/configEnv/configEnv.service';
import { DatabaseModule } from '../database/database.module';
import { GmailModule } from '../gmail/gmail.module';
import {  REPO_PORT } from './port/githubRepoPort';
import { githubRepository } from './repository/githubRepo';
import { PrismaHelper } from '../common/utils/prismaPattern';
import { CLIENT_PORT } from './port/githubClientPort';
import { githubClient } from './client/githubClient';

@Module({
    imports: [DatabaseModule, GmailModule],
  controllers: [GithubController],
  providers: [
    GithubService,
    Apikey,
    PrismaHelper,
    githubRepository,
    {
      provide: REPO_PORT,
      useClass: githubRepository
    },
     {
          provide: CLIENT_PORT,
          inject: [Apikey],
          useFactory: (apiKey: Apikey) => {
            return new githubClient(apiKey);
          },
        }
  ],
})
export class GithubModule {}
