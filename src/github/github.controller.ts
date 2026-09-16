import { BadRequestException, Controller, Get, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { GithubService } from './github.service';

import { ClerkService } from '../clerk/clerk.service';
import type { Response, Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { PrismaHelper } from '../common/utils/prismaPattern';
@Controller('github')
export class GithubController {


    constructor(private githubService: GithubService, private prisma: DatabaseService) { }


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
        const userId = req.auth.userId;


        const { access_token, refresh_token } =
            await this.githubService.exchangeCodeForToken(code);

        if (!access_token ) {
            throw new UnauthorizedException(
                "Github oauth failed",
            );
        }

        if(!refresh_token) {
            // console.log(refresh_token, "Token refreshnya tidak ada yahhh hehehe")
        }

        const token = access_token;


        await this.githubService.saveTokens({
            userId,
            accessToken: access_token,
            refreshToken: refresh_token
        })

        const githubUser =
            await this.githubService.getGithubUser(token);

        if (!githubUser) {
            throw new BadRequestException(
                "Github user not found",
            );
        }

        return res.json(githubUser);
    }

    @Get("connect")
    async connected(@Req() req: Request) {
        const userId = req.auth.userId

        const token = await this.githubService.getTokenFromDb(
            userId
        )
     
         if(!token) return

        return {
            connected: Boolean(token?.accessToken)
        }

    }

}
