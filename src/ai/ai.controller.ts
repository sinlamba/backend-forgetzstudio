import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { Public } from '../common/decorator/public.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Public()
  @Post("/chat")
  async chatBot(@Body("question") question: string) {
    return this.aiService.chat(question)
  }




}



