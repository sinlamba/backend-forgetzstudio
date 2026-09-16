import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { configEnvModule } from '../common/configEnv/config.module';
import { PrismaHelper } from '../common/utils/prismaPattern';

@Global()
@Module({
  imports: [configEnvModule],
  providers: [DatabaseService , PrismaHelper],
  exports: [DatabaseService , PrismaHelper],
})
export class DatabaseModule { }