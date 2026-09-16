import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';

import { StateAnnotation } from './state';

import { PlannerNode } from '../nodes/planner.node';
import { LlmNode } from '../nodes/llm.node';

import { RagNode } from '../nodes/rag.node';
import { McpNode } from '../nodes/mcp.node';

import { RagService } from '../rag/rag.service';
import { AiService } from '../ai/ai.service';
import { TesseractService } from '../tesseract/tesseract.service';
import { AnswerNode } from '../nodes/answer.nodes';
import { ValidatorLLM } from '../nodes/validator.node';

@Injectable()
export class GraphService {
  private readonly graph;

  constructor(
    private readonly Embedding: RagService,
    private readonly forgetzModels: AiService,
    private readonly validatorLLM: ValidatorLLM,
    private readonly plannerNode: PlannerNode,
    private readonly llmNode: LlmNode,
    private readonly answerNode: AnswerNode,

    private readonly ragNode: RagNode,
    private readonly mcpNode: McpNode,

    private readonly tesseractService: TesseractService,
  ) {
    this.graph = new StateGraph(StateAnnotation)

      // =========================
      // NODES
      // =========================

      .addNode(
        'planner',
        this.plannerNode.execute.bind(this.plannerNode),

      )
      .addNode("validatorLLM", this.validatorLLM.execute.bind(this.validatorLLM))

      .addNode(
        'rag',
        this.ragNode.execute.bind(this.ragNode),
      )

      .addNode(
        'mcp',
        this.mcpNode.execute.bind(this.mcpNode),
      )

      .addNode(
        'llm',
        this.llmNode.execute.bind(this.llmNode),
      )

      .addNode(
        'finalAnswer',
        this.answerNode.execute.bind(this.answerNode),
      )

      // =========================
      // START
      // =========================

      .addEdge(START, 'planner')

      // =========================
      // PLANNER ROUTING
      // =========================

      .addConditionalEdges(
        'planner',
        (state) => state.next,
        {
          rag: 'rag',
          mcp: 'mcp',
          llm: 'llm',
        },
      )

      // =========================
      // RAG / MCP → FINAL ANSWER
      // =========================

      .addEdge('rag', 'finalAnswer')
      .addEdge('mcp', 'finalAnswer')


      
      // =========================
      // NORMAL FINALANSWER → VALIDATOR
      // =========================
      .addEdge("finalAnswer" , "validatorLLM")

      // =========================
      // NORMAL LLM → END
      // =========================

      .addEdge('llm', END)

      // =========================
      // FINAL ANSWER → END
      // =========================

      .addEdge('finalAnswer', END)

      .addEdge("validatorLLM", END)


      .compile();
  }

  async invoke(question: string, userId: string) {
    const result = await this.graph.invoke({
      question,
      userId,
    });

    const answer = result.answer
      ?.replace(/\\n/g, '\n')
      ?.trim() ?? '';

    return {
      ...result,
      question: result.question,
      answer,
    };
  }

  async embedDoc(
    doc?: string,
    file?: Express.Multer.File,
  ) {
    let content = doc ?? '';

    let metadata: Record<string, any> = {};

    if (file) {
      content =
        await this.tesseractService.extractTextFromFile(file);

      metadata = {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    }

    if (!content || content.trim().length === 0) {
      throw new Error(
        'Konten dokumen atau file tidak boleh kosong',
      );
    }

    const data = await this.Embedding.insertDocument(
      content,
      metadata,
    );

    return data;
  }
}