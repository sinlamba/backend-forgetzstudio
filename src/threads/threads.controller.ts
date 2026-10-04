import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import type { Request, Response } from 'express';
import { Public } from '../common/decorator/public.decorator';
import { threadsPostDto } from './dto/threadsDto';
import { MappersThreadsGlobal } from './mappers/threads.mapper';

@Controller('threads')
export class ThreadsController {

    constructor(private readonly ThreadsSevice: ThreadsService) { }
@Public()
    @Get('/')
    async getUrlOauth(@Res() res: Response, @Req() req: Request) {
        const state = req.auth.userId
        const idUser = await this.ThreadsSevice.getUser(state)
        const url = this.ThreadsSevice.getUrl(idUser);

        return res.redirect(url);
    }
    @Public()
    @Get("/callback")
    async callback(
        @Query("code") code: string,
        @Query("state") state: string,
    ) {

        await this.ThreadsSevice.updateCrossPlatfrom(state)


        return this.ThreadsSevice.exchangeCodeForToken(
            state,
            code,
        );
    }


    @Get("/connect")
    async getConnection(@Req() req: Request) {
        const userId = await this.ThreadsSevice.getUser(req.auth.userId)

        const res = await this.ThreadsSevice.CheckConnectionThreads(userId, "Threads")

        return {
            connected: Boolean(res)
        }
    }

    @Post("createContainerId")
    async createContainer(@Body() body: threadsPostDto, @Req() req: Request) {

        // helper
        const scheduleParse = body.scheduledAt
            ? new Date(body.scheduledAt)
            : null;

        const userId = await this.ThreadsSevice.getUser(req.auth.userId)


        const accessToken = await this.ThreadsSevice.getAcessToken(userId, "Threads")




        return await this.ThreadsSevice.createContainerId({
            accessToken: accessToken.accessToken,
            userId: accessToken.platformUserId!,
            mediaType: "VIDEO",
            mediaUrl: body.videoUrl,
            text: body.caption,

        }, {
            userId: userId,
            scheduleAt: scheduleParse!
        })
    }





    async getContainerByUserId() {

    }






}
