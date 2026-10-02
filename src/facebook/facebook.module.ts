import { Module } from '@nestjs/common';

import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';
import { FACEBOOK_CLIENT } from './port/facebookClientPort';
import { Apikey } from '../common/configEnv/configEnv.service';
import { FacebookClient } from './client/facebookClient';

@Module({
  controllers: [FacebookController],

  providers: [
    Apikey,
    FacebookService,

    {
      provide: FACEBOOK_CLIENT,
      inject:[Apikey],
      useFactory:((apikey:Apikey) => {
      return new FacebookClient(apikey)
      })
    },
  ],

  exports: [
    FacebookService,
  ],
})
export class FacebookModule {}