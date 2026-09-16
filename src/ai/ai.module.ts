import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { McpModule } from '../mcp/mcp.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { configEnvModule } from '../common/configEnv/config.module';
import { Apikey } from '../common/configEnv/configEnv.service';

@Module({
  imports: [QdrantModule, McpModule, configEnvModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
