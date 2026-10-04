import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { MediapostService } from './mediapost.service';
import { createContainerDto } from './dto/createContainerDTO';
import type { Request } from 'express';
import { MediaPostRepo } from './repository/mediaPostRepo';

@Controller('mediapost')
export class MediapostController { 
   
     constructor(private readonly MediaPostService: MediapostService,
        private readonly MediaRepository: MediaPostRepo
     ){}



@Post("/createContainer")
async createContainer(
    @Body() body: createContainerDto,
    @Req() req: Request,
) {
    const user = await this.MediaRepository.getUsers(
        req.auth.userId,
    );

    const scheduledAt = body.scheduledAt
        ? new Date(body.scheduledAt)
        : null;

    return this.MediaPostService.createContainerGlobal(
        {
            videoUrl: body.videoUrl,
            scheduledAt,
            caption: body.caption,
            audioName: body.audioName,
        },
        user.id,
        scheduledAt!
    );
}


@Get('/getPlatformUsers')
async getPlaformUsers(@Req() req:Request) {
    const clerkId = req.auth.userId

     return this.MediaPostService.getCrossPlatformUsers(clerkId)
 
      
}



    
}
