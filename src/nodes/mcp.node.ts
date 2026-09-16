import { Injectable, Logger } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

import { StateAnnotation } from '../graph/state';
import { ToolService } from '../mcp/getTools.service';
import { AiService } from '../ai/ai.service';
import { LangfuseService } from '../langfuse/langfuse.service';

@Injectable()
export class McpNode {
  private readonly logger = new Logger(McpNode.name);

  constructor(
    private readonly aiService: AiService,
    private readonly toolService: ToolService,
    private readonly langfuse: LangfuseService,
  ) {}

  async execute(state: typeof StateAnnotation.State) {
    const question = state.question?.trim();

    /*
     * ==========================================
     * VALIDASI QUESTION
     * ==========================================
     */
    if (!question) {
      this.logger.warn('Pertanyaan tidak ditemukan.');

      return {
        ...state,
        toolResult: 'Pertanyaan tidak ditemukan.',
        toolSuccess: false,
        isCompleted: false,
      };
    }

    this.logger.debug(`MCP QUESTION: ${question}`);
    this.logger.debug(`MCP ROUTE: ${state.next}`);

    /*
     * ==========================================
     * GET MCP TOOLS
     * ==========================================
     */
    const tools = this.toolService.getTools();

    this.logger.debug(
      `MCP TOOLS: ${tools
        .map((tool) => tool.function.name)
        .join(', ')}`,
    );

    /*
     * ==========================================
     * MCP MODEL
     * ==========================================
     *
     * Model ini bertugas:
     * 1. Memahami permintaan user
     * 2. Memilih tool
     * 3. Membuat argument tool
     *
     * Eksekusi tool dilakukan oleh kode kita.
     */
    const model = this.aiService
      .getModel()
      .bindTools(tools);

    try {
      /*
       * ==========================================
       * LLM MEMILIH TOOL
       * ==========================================
       */
      const response = await model.invoke(
        [
          new SystemMessage(`
Kamu adalah MCP Agent yang bertugas melakukan tindakan menggunakan tools yang tersedia.

ATURAN:

1. Jika user meminta melakukan suatu tindakan yang dapat dilakukan oleh tool, WAJIB gunakan tool tersebut.

2. Jika user meminta mengirim email, WAJIB gunakan tool "sendEmail".

3. Jangan hanya menjelaskan cara melakukan tindakan jika tool tersedia.

4. Jika user meminta email dikirim, jangan hanya membuat draft. Gunakan "sendEmail".

5. Jika user meminta dibuatkan subject dan body email, buat subject dan body berdasarkan konteks yang diberikan user.

6. Jangan mengarang fakta, nama, tanggal, angka, atau informasi penting yang tidak diberikan user.

7. Jika informasi wajib untuk menjalankan tool tidak tersedia, jangan membuat data palsu.

8. Gunakan tool yang paling sesuai dengan permintaan user.

9. Pastikan semua argument tool mengikuti schema tool yang tersedia.
          `.trim()),
          new HumanMessage(question),
        ],
        {
          callbacks: [this.langfuse.callback()],
        },
      );

      const toolCalls = response.tool_calls ?? [];

      this.logger.debug(
        `TOOL CALLS: ${JSON.stringify(toolCalls)}`,
      );

      /*
       * ==========================================
       * TIDAK ADA TOOL
       * ==========================================
       */
      if (toolCalls.length === 0) {
        this.logger.warn(
          'Tidak ada tool yang dipanggil.',
        );

        return {
          ...state,
          toolName: '',
          toolArgs: [],
          toolResult:
            'Tidak ada tool yang dipanggil.',
          toolSuccess: false,
          isCompleted: false,
        };
      }

      /*
       * ==========================================
       * EXECUTE TOOLS
       * ==========================================
       */
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          try {
            this.logger.debug(
              `EXECUTING TOOL: ${toolCall.name}`,
            );

            this.logger.debug(
              `TOOL ARGS: ${JSON.stringify(
                toolCall.args,
              )}`,
            );

            const result =
              await this.toolService.execute(
                toolCall.name,
                toolCall.args,
                state.userId,
              );

            this.logger.debug(
              `TOOL RESULT [${toolCall.name}]: ${JSON.stringify(
                result,
              )}`,
            );

            return {
              name: toolCall.name,
              success: true,
              result,
            };
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : String(error);

            this.logger.error(
              `TOOL ERROR [${toolCall.name}]: ${message}`,
            );

            return {
              name: toolCall.name,
              success: false,
              error: message,
            };
          }
        }),
      );

      /*
       * ==========================================
       * STATUS TOOL
       * ==========================================
       *
       * Semua tool harus sukses.
       *
       * Contoh:
       *
       * sendEmail -> success true
       *
       * maka:
       *
       * toolSuccess = true
       * isCompleted = true
       */
      const toolSuccess =
        toolResults.length > 0 &&
        toolResults.every(
          (item) => item.success === true,
        );

      const isCompleted = toolSuccess;

      /*
       * ==========================================
       * COMBINE TOOL RESULT
       * ==========================================
       */
      const combinedResult = toolResults
        .map((item) => {
          if (item.success) {
            return `[Tool '${item.name}']: ${JSON.stringify(
              item.result,
            )}`;
          }

          return `[Tool '${item.name}' Error]: ${item.error}`;
        })
        .join('\n');

      /*
       * ==========================================
       * LOG STATUS
       * ==========================================
       */
      this.logger.debug(
        `COMBINED RESULT: ${combinedResult}`,
      );

      this.logger.debug(
        `TOOL SUCCESS: ${toolSuccess}`,
      );

      this.logger.debug(
        `COMPLETED: ${isCompleted}`,
      );

      /*
       * ==========================================
       * RETURN STATE
       * ==========================================
       */
      return {
        ...state,

        toolName: toolCalls
          .map((toolCall) => toolCall.name)
          .join(', '),

        toolArgs: toolCalls.map(
          (toolCall) =>
            toolCall.args as Record<
              string,
              unknown
            >,
        ),

        toolResult: combinedResult,

        toolSuccess,

        isCompleted,
      };
    } catch (error) {
      /*
       * ==========================================
       * MCP ERROR
       * ==========================================
       */
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      this.logger.error(
        `MCP NODE ERROR: ${message}`,
        error instanceof Error
          ? error.stack
          : undefined,
      );

      return {
        ...state,
        toolResult: `[MCP Error]: ${message}`,
        toolSuccess: false,
        isCompleted: false,
      };
    }
  }
}