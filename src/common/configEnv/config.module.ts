import { Module } from '@nestjs/common';
import { Apikey } from './configEnv.service';

@Module({
  providers: [Apikey],
  exports: [Apikey],
})
export class configEnvModule {}
