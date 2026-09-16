import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [QdrantModule],

  providers: [RagService],

  exports: [RagService],
})
export class RagModule {}
