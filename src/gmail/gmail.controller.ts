import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GmailService } from './gmail.service';

@Controller('gmail')
export class GmailController {
  constructor(
    private readonly gmailService: GmailService,
  ) { }


  @Get("/")
  async getSignUrl(@Res() res: Response, @Req() req: Request) {
    const userId = req.auth.userId
    const result = await this.gmailService.getUrl(userId)
    return res.redirect(result)
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    try {

      const userId = await this.gmailService.getUser(req.auth.userId)
      if (error) {
        return res.redirect(
          `http://localhost:3000/dashboard?gmail=denied`,
        );
      }

      if (!code) {
        console.log("ini eror satu")
        return res.redirect(
          `http://localhost:3000/dashboard?gmail=error`,
        );
      }
      await this.gmailService.handleCallback(code, userId);
      return res.redirect(
        `http://localhost:3000`,
      );
    } catch (error : any) {
      console.error(
        'GOOGLE CALLBACK ERROR:',
        error.messages|| error,
      );

      return res.redirect(
        `http://localhost:3000/dashboard?gmail=error`,
      );
    }
  }


  @Get('messages')
  async getMessages(@Req() req: Request) {
    const userId = req.auth.userId;

    const {accessToken , refreshToken }= await this.gmailService.getAccessTokenFromDb(
      userId

    )
    if (!accessToken || !refreshToken) {
      throw new Error("ACCESS_TOKEN_NOT_FOUND")
    }



    return this.gmailService.getMessages(
      accessToken
    );
  }


  @Get('messages/:id')
  async getMessageById(
    @Param('id') messageId: string,
    @Req() req: Request,
  ) {
         const userId = await this.gmailService.getUser(req.auth.userId)

    const {accessToken, refreshToken} = await this.gmailService.getAccessTokenFromDb(userId)
    if (!accessToken || !refreshToken) {
      throw new Error("ACCESS_TOKEN_NOT_FOUND")
    }

    return this.gmailService.getMessageContent(
     
     userId,
      messageId,
    );
  }


@Get("connect")
async connection(@Req() req: Request) {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    throw new UnauthorizedException("UNAUTHORIZED");
  }

  const userId = await this.gmailService.getUser(
    clerkUserId,
  );

  const token = await this.gmailService.checkUserConnection(
    userId,
    "Gmail"
  );



  return {
    connected: Boolean(token),
  };
}

  @Get("attachment")
  async getAttachment(@Req() req: Request) {
      const userId = await this.gmailService.getUser(req.auth.userId)
  const {accessToken , refreshToken} = await this.gmailService.getAccessTokenFromDb(userId)
    if (!accessToken || !refreshToken) {
      throw new Error("Not found token");
    }

    const messagesList =
      await this.gmailService.getMessages(
        userId
      );

    const messageId =
      messagesList[0]?.id;

    if (!messageId) {
      throw new Error("Message not found");
    }


    const result =
      await this.gmailService.getPdfTextAndSendToPython(
        userId,
        messageId
      );


    
    
      this.gmailService.filteringData(userId, messageId)

    return result;
  }




}