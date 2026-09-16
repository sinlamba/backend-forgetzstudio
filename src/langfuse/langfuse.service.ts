import { Injectable } from '@nestjs/common';
import { CallbackHandler } from '@langfuse/langchain';
@Injectable()
export class LangfuseService {
  private callbacks = new CallbackHandler();

  callback() {
    return this.callbacks;
  }
}
