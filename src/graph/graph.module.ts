import { Module } from '@nestjs/common';

import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';

import { PlannerNode } from '../nodes/planner.node';
import { RagNode } from '../nodes/rag.node';
import { McpNode } from '../nodes/mcp.node';
import { LlmNode } from '../nodes/llm.node';

import { AiModule } from '../ai/ai.module';
import { RagModule } from '../rag/rag.module';
import { McpModule } from '../mcp/mcp.module';
import { LangfuseService } from '../langfuse/langfuse.service';
import { TesseractModule } from '../tesseract/tesseract.module';
import { LangfuseModule } from '../langfuse/langfuse.module';
import { AnswerNode } from '../nodes/answer.nodes';
import { ValidatorLLM } from '../nodes/validator.node';
import { GmailModule } from '../gmail/gmail.module';

@Module({
  imports: [GmailModule,AiModule, RagModule, McpModule, LangfuseModule, TesseractModule],

  controllers: [GraphController],

  providers: [
    GraphService,
    PlannerNode,
    RagNode,
    McpNode,
    LlmNode,
    LangfuseService,
    AnswerNode,
    ValidatorLLM
  ],
})
export class GraphModule {}
