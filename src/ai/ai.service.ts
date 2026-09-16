import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Apikey } from '../common/configEnv/configEnv.service';
@Injectable()
export class AiService {
  private readonly model: ChatOpenAI;


  constructor(private config: Apikey) {

    this.model = new ChatOpenAI({
      model: 'oc/ling-3.0-flash-fin-free',

      apiKey: config.getApikey('ROUTER_KEY'),

      maxTokens: 2000,

      configuration: {
        baseURL: config.getApikey('BASE_URL_OPENROUTER'),

        defaultHeaders: {
          'HTTP-Referer': this.config.getApikey('URL_ACCESS'),

          'X-Title': 'AI Agent',
        },
      },
    });
  }

  async chat(question: string, context?: string, toolResult?: string) {
    const response = await this.model.invoke([
      new SystemMessage(`
Kamu adalah AI Assistant.

Gunakan informasi berikut jika tersedia:

Context:
${context ?? ''}


Tool Result:
${toolResult ?? ''}

Jika informasi tidak tersedia,
katakan bahwa kamu tidak tahu.
        `),

      new HumanMessage(question),
    ]);
    // TARUH CLG DI SINI
    // console.log('MODEL CONTENT:', response.content);
    // console.log('TOOL CALLS:', response.tool_calls);
    // console.log('FULL RESPONSE:', response);
    return response.content.toString();
  }

  getModel() {

    return this.model;
  }
  getAnswerModel() {
    return this.model;
  }

}
