import { Injectable } from '@nestjs/common';
import { StateAnnotation } from '../graph/state';
import { RagService } from '../rag/rag.service';

@Injectable()
export class RagNode {
  constructor(private readonly ragService: RagService) {}

  async execute(state: typeof StateAnnotation.State) {
    const context = await this.ragService.search(state.question);

    return {
      ...state,

      context,
    };
  }
}
