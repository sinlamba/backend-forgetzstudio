import { Injectable, Logger } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

import { StateAnnotation } from '../graph/state';
import { AiService } from '../ai/ai.service';
import { LangfuseService } from '../langfuse/langfuse.service';

@Injectable()
export class LlmNode {
  private readonly logger = new Logger(LlmNode.name);

  constructor(
    private readonly aiService: AiService,
    private readonly langfuse: LangfuseService,
  ) {}

  async execute(state: typeof StateAnnotation.State) {
    const question = state.question?.trim();

    this.logger.debug('LLM NODE');
    this.logger.debug(`QUESTION: ${question}`);

    if (!question) {
      this.logger.warn('Question kosong');

      return {
        ...state,
        answer:
          'Maaf, pertanyaan tidak ditemukan. Silakan coba lagi.',
      };
    }

    const model = this.aiService.getModel();

    const systemPrompt = `
Kamu adalah AI Assistant.

Tugasmu adalah menjawab pertanyaan pengguna secara langsung.

Aturan:
1. Jawab pertanyaan berdasarkan pengetahuan yang kamu miliki.
2. Gunakan bahasa Indonesia.
3. Jawab dengan jelas, singkat, dan natural.
4. Jangan membahas proses internal sistem.
5. Jangan menyebut planner, route, MCP, RAG, tool, atau workflow.
6. Jangan mengembalikan JSON atau metadata.
7. SELALU berikan jawaban dalam bentuk teks biasa.
`.trim();

    try {
      const response = await model.invoke(
        [
          new SystemMessage(systemPrompt),
          new HumanMessage(question),
        ],
        {
          callbacks: [this.langfuse.callback()],
        },
      );

      this.logger.debug(
        `RAW RESPONSE: ${this.stringify(response.content)}`,
      );

      const answer = this.extractText(response.content);

      if (!answer) {
        this.logger.warn('LLM menghasilkan jawaban kosong');

        return {
          ...state,
          answer:
            'Maaf, saya tidak dapat menghasilkan jawaban saat ini.',
        };
      }

      this.logger.debug(`FINAL ANSWER: ${answer}`);

      return {
        ...state,
        answer: this.cleanAnswer(answer),
      };
    } catch (error) {
      this.logger.error(
        'Gagal memanggil LLM',
        error instanceof Error ? error.stack : String(error),
      );

      return {
        ...state,
        answer:
          'Maaf, terjadi kendala saat memproses pertanyaan.',
      };
    }
  }

  private extractText(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((block) => {
          if (typeof block === 'string') {
            return block;
          }

          if (
            block &&
            typeof block === 'object' &&
            'text' in block
          ) {
            return String(
              (block as { text?: unknown }).text ?? '',
            );
          }

          return '';
        })
        .join('')
        .trim();
    }

    return '';
  }

  private cleanAnswer(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();
  }

  private stringify(value: unknown): string {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return '[EMPTY]';
    }

    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
}