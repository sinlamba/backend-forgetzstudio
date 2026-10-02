import { Module } from '@nestjs/common';
import { MediapostService } from './mediapost.service';
import { MediapostController } from './mediapost.controller';
import { CLIENT_PORT as InstagramClientPort } from '../instagram/port/instagramClientPort';
import { InstagramClient } from '../instagram/client/instagramClient';
import { REPO_PORT as InstagramRepoPort } from '../instagram/port/instagramRepoPort';
import { InstagramRepository } from '../instagram/repository/instagramRepo';
import { REPO_PORT } from '../threads/port/threadsRepoPort';
import { CLIENT_PORT } from '../threads/port/threadsClientPort';
import { Apikey } from '../common/configEnv/configEnv.service';
import { ThreadsClient } from '../threads/client/threadsClient';
import { threadsRepository } from '../threads/repository/threadsRepo';
import { MediaPostRepo } from './repository/mediaPostRepo';
import { DatabaseModule } from '../database/database.module';
import { TiktokClient } from '../tiktok/client/tiktokClient';
import { HttpTransportGlobal } from '../common/utils/httpTransportGlobal';
import { TIKTOK_CLIENT } from '../tiktok/port/tiktokClientPort';

@Module({
  imports:[DatabaseModule],
  providers: [MediapostService,
    Apikey,
    InstagramRepository,
    MediaPostRepo,
    {
      provide: InstagramClientPort,
      inject: [Apikey, InstagramRepository],
      useFactory: (apiKey: Apikey, repo: InstagramRepository) => {
        return new InstagramClient(repo, apiKey);
      },
    },
    {
      provide: InstagramRepoPort,
      useClass: InstagramRepository
    },
    {
      provide: REPO_PORT,
      useClass: threadsRepository,
    },
    {
      provide: CLIENT_PORT,
      inject: [Apikey],
      useFactory: (apiKey: Apikey) => {
        return new ThreadsClient(apiKey);
      },
    },
     {
      provide: TIKTOK_CLIENT,
      inject: [
        Apikey,
    
      ],
      useFactory: (
        apiKey: Apikey,
      
      ) => {
        return new TiktokClient(
          apiKey
        );
      },
    },

  ],
  controllers: [MediapostController]
})
export class MediapostModule { }
