
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  Request,
  Response,
} from 'express';

import { InstagramService } from './instagram.service';
import { Public } from '../common/decorator/public.decorator';
import { InstagramPostDTO } from '../common/dto/instagramPostDTO';

import { SaveVideoUrlDto } from './dto/videoUrl';
import { calculateTokenExpiresAt } from './utils/covertDate';

@Controller('instagram')
export class InstagramController {
  constructor(
    private readonly instagram: InstagramService,

  ) { }

  @Get()
  async login(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = await this.instagram.getUserId(req.auth.userId)


    if (!userId) {
      return res.status(401).json({
        message: 'User is not authenticated',
      });
    }

    const loginUrl =
      this.instagram.getLoginUrl(userId);

    return res.redirect(loginUrl);
  }


  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const instagram =
      await this.instagram.callback(
        code,
        state,
      )
    await this.instagram.updateCrossPlatfrom(state)
    await this.instagram.saveTokens(
      {
        userId: instagram.userId,
        access_token: instagram.accessToken,
        platform: "Instagram",
        expiresAt: calculateTokenExpiresAt(instagram.expiresIn! | 0),
        refreshToken: instagram.refreshToken,
        platformUserId: instagram.instagramUserId
      }

    );

    return {
      success: true,
      message:
        'Instagram connected successfully',
      instagram: {
        userId: instagram.instagramUserId,
        username: instagram.username,
        accountType: instagram.accountType,
      },
    };
  }

  @Get('connect')
  async connection(@Req() req: Request) {
    const userId = await this.instagram.getUserId(req.auth.userId)


    const token = await this.instagram.getAccessToken(
      userId,
      "Instagram"
    )

    return {
      connected: Boolean(token)
    }
  }


  @Public()
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.instagram.webHooks(
      mode,
      challenge,
      token,
    );
  }

  @Public()
  @Post('webhook')
  receiveWebhook(
    @Body() body: any,
  ) {
    return this.instagram.handleWebhook(
      body,
    );
  }

  @Post("CreatecontainerId")
  async containerPost(
    @Req() req: Request,
    @Body() post: InstagramPostDTO,
  ) {
    const userId = await this.instagram.getUserId(req.auth.userId)

    const scheduleParse = post.scheduledAt
      ? new Date(post.scheduledAt)
      : null;

    const instagramUser = await this.instagram.getAccessToken(
      userId,
      "Instagram",
    );

    if (!instagramUser.platformUserId) {
      throw new NotFoundException(
        "Instagram account not connected",
      );
    }

    if (!instagramUser.accessToken) {
      throw new UnauthorizedException(
        "Instagram access token not found",
      );
    }

    try {
      const result = await this.instagram.createContainer( {
        platfromUserId: instagramUser.platformUserId,
        videoUrl: post.videoUrl,
        caption: post.caption,
        audioName: post.audioName,
        userId: userId,
        accessToken: instagramUser.accessToken,
        scheduledAt: scheduleParse,
      });


      if (!result.data.instagramContainerId) {
        throw new BadRequestException(
          "Instagram container ID not returned",
        );
      }

      return {
        success: true,
        data: {
          IgcontainerId: result.data.instagramContainerId,
          instagramUserId: instagramUser.platformUserId,
        },
      };
    } catch (err: unknown) {
      console.error(
        "Instagram container error:",
        err,
      );

      throw err;
    }
  }
  @Get("me")
  async getUser(@Req() req: Request) {
    const userId = await this.instagram.getUserId(req.auth.userId,)

    try {
      return await this.instagram.getProfile(
        userId
      );
    } catch (error) {
      console.error("Instagram error:", error);

      throw error;
    }
  }

  // @Get("containerId")
  // async getContainerPost(
  //   @Req() req: Request
  // ) {
  //   const userId = await this.instagram.getUserId(req.auth.userId)


  //   const token = await this.instagram.getAccessToken(
  //     userId,
  //     "Instagram"
  //   );

  //   if (!token?.accessToken) {
  //     throw new BadRequestException("token not found");
  //   }

  //   const containerIds =
  //     await this.instagram.getInstagramContainer(userId);

  //   const result: string[] = [];

  //   for (const containerId of containerIds) {
  //     const url = new URL(
  //       `https://graph.instagram.com/v25.0/${containerId}`
  //     );

  //     url.searchParams.set(
  //       "fields",
  //       "id,status_code"
  //     );

  //     url.searchParams.set(
  //       "access_token",
  //       token.accessToken
  //     );

  //     const res = await fetch(url);

  //     const data = await res.json();

  //     result.push(data);
  //   }

  //   return result;
  // }

  @Get("CheckContainerId")
  async getContainerId(@Req() req: Request) {

    const userId = await this.instagram.getUserId(req.auth.userId)


    return this.instagram.getInstagramContainer(userId)


  }

  @Get("instagramContainerUser")
  async getInstagramContainerUser(@Req() req: Request) {
    const userId = await this.instagram.getUserId(req.auth.userId)


    const response = await this.instagram.findUserInstagramContainer(userId)


    return response

  }

  @Post("saveVidUrl")
  async saveVideoUrl(@Req() req: Request, @Body() body: SaveVideoUrlDto) {
    const userId = await this.instagram.getUserId(req.auth.userId)

    return this.instagram.saveVideoUrl({
      videoUrl: body.videoUrl,
      userId: userId,
    })
  }
  @Get("getVidUrl")
  async getVideoUrl(@Req() req: Request) {
    const userId = await this.instagram.getUserId(req.auth.userId)


    return this.instagram.getLinkVideoUrl(userId)
  }
}



