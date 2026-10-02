import { Module } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { TiktokController } from './tiktok.controller';
import { Apikey } from '../common/configEnv/configEnv.service';
import { TIKTOK_CLIENT } from './port/tiktokClientPort';
import { TiktokClient } from './client/tiktokClient';
import { DatabaseModule } from '../database/database.module';
import { TIKTOK_REPO } from './port/tiktokRepoPort';
import { TiktokRepository } from './repository/tiktokRepository';

@Module({
  imports: [DatabaseModule],
  providers: [TiktokService, Apikey,  TiktokClient, {
    provide: TIKTOK_CLIENT,
    inject: [Apikey],
    useFactory: (apiKey: Apikey) => {
      return new TiktokClient(apiKey)
    }
  }, {
      provide: TIKTOK_REPO,
      useClass: TiktokRepository

    }],
  controllers: [TiktokController]
})
export class TiktokModule { }
