import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { Public } from '../common/decorator/public.decorator';
import type { Request, Response } from 'express';

@Controller('tiktok')
export class TiktokController {
  constructor(private readonly tiktokService: TiktokService) { }

  @Get('/')
  async getOAuthUrl(@Req() req: Request, @Res() res: Response) {
    const userId = req.auth.userId;
    const url = await this.tiktokService.getOAuthUrl(userId);

    return res.redirect(url);
  }

  @Public()
  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string) {
    const userId = await this.tiktokService.getUserId(state);
    await this.tiktokService.updateCrossPlatfrom(userId)
    return this.tiktokService.getCallbackUrl({
      code: code,
      userId: userId,
    });
  }

  @Get('connect')
  async checkConnection(@Req() req: Request) {
    const userId = req.auth.userId;
    const res = await this.tiktokService.checkConnection(userId);

    return {
      connected: Boolean(res),
    };
  }
}
