import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
  ) {}

  @Get('/')
  connect(@Query('state') state: string) {
    return {
      url: this.facebookService.getOAuthUrl(state),
    };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.facebookService.exchangeCodeForToken({
      code,
      state,
    });
  }

  @Get('pages')
  async getPages(
    @Query('accessToken') accessToken: string,
  ) {
    return this.facebookService.getPages(accessToken);
  }

  @Get('page')
  async getPage(
    @Query('pageId') pageId: string,
    @Query('pageAccessToken') pageAccessToken: string,
  ) {
    return this.facebookService.getPage({
      pageId,
      pageAccessToken,
    });
  }

  @Post('post')
  async createPost(
    @Body()
    body: {
      pageId: string;
      pageAccessToken: string;
      message: string;
    },
  ) {
    return this.facebookService.createPost(body);
  }
}