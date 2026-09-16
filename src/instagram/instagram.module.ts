import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { Apikey } from '../common/configEnv/configEnv.service';
import { DatabaseModule } from '../database/database.module';
import { InstagramRepository } from './repository/instagram.repo';
import { InstagramClient } from './client/instagram.client';
import { INSTAGRAM_PORT } from './port/instagram.port';
import { REPO_PORT } from './port/repository.port';

@Module({
  imports: [DatabaseModule],
  providers: [InstagramRepository,InstagramService, InstagramClient, InstagramRepository, Apikey, {
    provide: INSTAGRAM_PORT,
    useClass: InstagramClient
  }, {
    provide: REPO_PORT,
    useClass: InstagramRepository
  }],
  controllers: [InstagramController]
})
export class InstagramModule { }
