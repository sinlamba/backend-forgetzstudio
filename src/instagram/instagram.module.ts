import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { Apikey } from '../common/configEnv/configEnv.service';
import { DatabaseModule } from '../database/database.module';
import { InstagramRepository } from './repository/instagramRepo';
import { InstagramClient } from './client/instagramClient';
import { REPO_PORT } from './port/instagramRepoPort';
import { CLIENT_PORT } from './port/instagramClientPort';
import { ThreadsClient } from '../threads/client/threadsClient';
import { threadsRepository } from '../threads/repository/threadsRepo';


@Module({
  imports: [DatabaseModule],
  providers: [InstagramRepository, InstagramService, InstagramClient, InstagramRepository, Apikey, {
    provide: CLIENT_PORT,
    useClass: InstagramClient
  }, {
      provide: REPO_PORT,
      useClass: InstagramRepository
    },
  
  ],
  controllers: [InstagramController]
})
export class InstagramModule { }








