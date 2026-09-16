import { Controller, Post, Body, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GraphService } from './graph.service';
import type { Request, Response } from 'express';
import { GmailService } from '../gmail/gmail.service';

@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService, private readonly gmail: GmailService) { }
  @Post()
  async invoke(
    @Body('question') question: string,
    @Req() req: Request,
  ) {
    const userId = req.auth.userId;
    const accessToken = await this.gmail.getAccessTokenFromDb({
      userId: userId,
      provider: "Gmail"
    })
    return this.graphService.invoke(question, accessToken[0]);
  }

  @Post('/doc')
  @UseInterceptors(FileInterceptor('file'))
  async UploadDoc(
    @Body('doc') doc?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.graphService.embedDoc(doc, file);
  }
}



