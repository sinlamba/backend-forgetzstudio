import { BadRequestException, Controller, Get, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { GithubService } from './github.service';

import { ClerkService } from '../clerk/clerk.service';
import type { Response, Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { PrismaHelper } from '../common/utils/prismaPattern';
@Controller('github')
export class GithubController {


    constructor(private githubService: GithubService) { }


    @Get("/")
    getUrl(@Res() res: Response) {

        const result = this.githubService.getSignUrl()
        return res.redirect(result)
    }
 @Get("callback")
async getCallback(
    @Res() res: Response,
    @Req() req: Request,
    @Query("code") code: string,
) {
    const userId =
        await this.githubService.getUser(req.auth.userId);

    const response =
        await this.githubService.exchangeCodeForToken(code);

    console.log(
        "GITHUB OAUTH RESPONSE:",
        response,
    );

    const {
        access_token,
        refresh_token,
    } = response;

    if (!access_token) {
        throw new UnauthorizedException(
            "Github oauth failed",
        );
    }

    const githubUser =
        await this.githubService.getGithubUser(
            access_token,
        );

    if (!githubUser) {
        throw new BadRequestException(
            "Github user not found",
        );
    }

    console.log(
        "GITHUB USER:",
        githubUser,
    );

    await this.githubService.saveTokens({
        userId,

        accessToken: access_token,

        refreshToken: refresh_token ?? null,

        provider: "Github",

        platfromUserId:
            String(githubUser.id),
    });

    return res.json({
        success: true,
        githubUser,
        tokenInfo: {
            hasAccessToken: Boolean(access_token),
            hasRefreshToken: Boolean(refresh_token),
        },
    });
}
    @Get("connect")
    async connected(@Req() req: Request) {
        const userId = await this.githubService.getUser(req.auth.userId);

        const token = await this.githubService.getTokenFromDb(
            userId,
            "Github"
        )

        if (!token) return

        return {
            connected: Boolean(token?.accessToken)
        }

    }

}
