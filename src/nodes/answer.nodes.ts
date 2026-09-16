import { Injectable, Logger } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

import { StateAnnotation } from '../graph/state';
import { AiService } from '../ai/ai.service';
import { LangfuseService } from '../langfuse/langfuse.service';

@Injectable()
export class AnswerNode {
  private readonly logger = new Logger(AnswerNode.name);

  constructor(
    private readonly aiService: AiService,
    private readonly langfuse: LangfuseService,
  ) {}

  async execute(
    state: typeof StateAnnotation.State,
  ) {
    const question = state.question?.trim();

    if (!question) {
      return {
        ...state,
        answer: 'Pertanyaan tidak ditemukan.',
      };
    }

    const toolResult = this.stringify(
      state.toolResult,
      '[TIDAK ADA HASIL TOOL]',
    );

    const context = this.stringify(
      state.context,
      '[TIDAK ADA CONTEXT]',
    );

    const toolName = this.stringify(
      state.toolName,
      '[TIDAK ADA TOOL]',
    );

    const toolSuccess =
      state.toolSuccess ?? false;

    const isCompleted =
      state.isCompleted ?? false;

    this.logger.debug(
      `QUESTION: ${question}`,
    );

    this.logger.debug(
      `TOOL NAME: ${toolName}`,
    );

    this.logger.debug(
      `TOOL SUCCESS: ${toolSuccess}`,
    );

    this.logger.debug(
      `COMPLETED: ${isCompleted}`,
    );

    this.logger.debug(
      `TOOL RESULT: ${toolResult}`,
    );

    this.logger.debug(
      `CONTEXT: ${context}`,
    );

    /*
     * Answer model hanya bertugas membuat
     * jawaban final.
     *
     * Tidak digunakan untuk tool calling.
     */
    const model =
      this.aiService.getAnswerModel();

    const systemPrompt = `
Kamu adalah AI Assistant yang memberikan jawaban FINAL kepada pengguna.

DATA HASIL TOOL:
${toolResult}

NAMA TOOL:
${toolName}

STATUS TOOL:
${toolSuccess ? 'BERHASIL' : 'GAGAL'}

STATUS PROSES:
${isCompleted ? 'SELESAI' : 'BELUM SELESAI'}

INFORMASI DOKUMEN:
${context}

ATURAN:

1. Jawab pertanyaan pengguna berdasarkan data yang tersedia.

2. Jika tool berhasil dan proses selesai:
   - Anggap tindakan tersebut benar-benar berhasil.
   - Berikan konfirmasi yang jelas kepada pengguna.

3. Jika tool yang digunakan adalah sendEmail dan:
   - STATUS TOOL = BERHASIL
   - STATUS PROSES = SELESAI

   Beritahu pengguna bahwa email berhasil dikirim.

4. Jika tool gagal:
   - Jangan mengatakan bahwa tindakan berhasil.
   - Jelaskan bahwa tindakan gagal berdasarkan informasi yang tersedia.

5. Jika INFORMASI DOKUMEN relevan:
   - Gunakan informasi tersebut.
   - Jangan mengarang informasi yang tidak tersedia.

6. Jika DATA HASIL TOOL relevan:
   - Prioritaskan data tersebut.
   - Jangan mengubah atau mengarang hasil tool.

7. Jika informasi tidak cukup:
   - Katakan bahwa informasi yang tersedia belum cukup.
   - Jangan membuat jawaban berdasarkan asumsi.

8. Jangan menyebut:
   - MCP
   - RAG
   - tool
   - workflow
   - route
   - context
   - proses internal sistem

9. Jawab langsung kepada pengguna.

10. Gunakan bahasa Indonesia.

11. Jawab singkat, jelas, dan natural.

12. SELALU berikan jawaban dalam bentuk teks biasa.

13. Jangan mengembalikan JSON atau metadata.
`.trim();

    try {
      const response =
        await model.invoke(
          [
            new SystemMessage(
              systemPrompt,
            ),
            new HumanMessage(question),
          ],
          {
            callbacks: [
              this.langfuse.callback(),
            ],
          },
        );

      /*
       * Debug response lengkap.
       * Ini penting jika content kosong.
       */
      this.logger.debug(
        `FULL RESPONSE: ${JSON.stringify(
          response,
          null,
          2,
        )}`,
      );

      this.logger.debug(
        `CONTENT TYPE: ${typeof response.content}`,
      );

      this.logger.debug(
        `RAW RESPONSE: ${JSON.stringify(
          response.content,
          null,
          2,
        )}`,
      );

      const answer =
        this.extractText(
          response.content,
        );

      if (!answer) {
        this.logger.warn(
          'Final answer kosong',
        );

        /*
         * Fallback berdasarkan status
         * backend, bukan berdasarkan tebakan LLM.
         */
        if (
          toolName === 'sendEmail' &&
          toolSuccess &&
          isCompleted
        ) {
          return {
            ...state,
            answer:
              'Email berhasil dikirim.',
          };
        }

        return {
          ...state,
          answer:
            'Maaf, saya tidak menemukan jawaban berdasarkan informasi yang tersedia.',
        };
      }

      this.logger.debug(
        `FINAL ANSWER: ${answer}`,
      );

      return {
        ...state,
        answer,
      };
    } catch (error) {
      this.logger.error(
        'Gagal membuat final answer',
        error instanceof Error
          ? error.stack
          : String(error),
      );

      /*
       * Jika tool sebenarnya sudah berhasil,
       * jangan membuat user mengira email gagal
       * hanya karena Answer LLM bermasalah.
       */
      if (
        toolName === 'sendEmail' &&
        toolSuccess &&
        isCompleted
      ) {
        return {
          ...state,
          answer:
            'Email berhasil dikirim.',
        };
      }

      return {
        ...state,
        answer:
          'Maaf, terjadi kendala saat membuat jawaban.',
      };
    }
  }

  private extractText(
    content: unknown,
  ): string {
    if (typeof content === 'string') {
      return this.cleanAnswer(
        content,
      );
    }

    if (!Array.isArray(content)) {
      return '';
    }

    const text = content
      .map((block) => {
        if (typeof block === 'string') {
          return block;
        }

        if (
          block &&
          typeof block === 'object'
        ) {
          const item =
            block as Record<
              string,
              unknown
            >;

          if (
            typeof item.text === 'string'
          ) {
            return item.text;
          }

          if (
            item.type === 'text' &&
            typeof item.text ===
              'string'
          ) {
            return item.text;
          }
        }

        return '';
      })
      .join('');

    return this.cleanAnswer(text);
  }

  private cleanAnswer(
    text: string,
  ): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();
  }

  private stringify(
    value: unknown,
    fallback = '[EMPTY]',
  ): string {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return fallback;
    }

    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(
        value,
        null,
        2,
      );
    } catch {
      return String(value);
    }
  }
}