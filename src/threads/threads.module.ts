import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { DatabaseModule } from '../database/database.module';
import { REPO_PORT } from './port/threadsRepoPort';
import { threadsRepository } from './repository/threadsRepo';
import { ThreadsController } from './threads.controller';
import { CLIENT_PORT, } from './port/threadsClientPort';
import { ThreadsClient } from './client/threadsClient';
import { Apikey } from '../common/configEnv/configEnv.service';

@Module({
  imports: [DatabaseModule],
  providers: [ThreadsService, Apikey, {
    provide: REPO_PORT,
    useClass: threadsRepository,
  },
    {
      provide: CLIENT_PORT,
      inject: [Apikey],
      useFactory: (apiKey: Apikey) => {
        return new ThreadsClient(apiKey);
      },
    }],
  controllers: [ThreadsController]
})
export class ThreadsModule { }
