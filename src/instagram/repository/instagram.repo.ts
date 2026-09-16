import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { getTokenResultType, getVideoLinkType, instagramContainerResultType, provider, saveContainerId, saveInstagramAccessToken, saveLinkVideo, saveLinkVideType, saveTokenInstagramResult } from "../types";
import { RepositoryPort } from "../port/repository.port";




@Injectable()
export class InstagramRepository implements RepositoryPort {


    constructor(private readonly Prisma: DatabaseService) { }

  

    async saveTokensInstagram({ userId, access_token, provider, providerAccountId }: saveInstagramAccessToken): Promise<saveTokenInstagramResult> {

        return await this.Prisma.integration.create({
            data: {
                userId: userId,
                accessToken: access_token,
                provider: provider,
                providerAccountId: providerAccountId


            }




        })








    }

    async saveContainerId({ userId, containerId, instagramUserId, scheduledAt }: saveContainerId) {

        return await this.Prisma.IntagramContainer.create(
            {
                data: {
                    userId,
                    containerId,
                    instagramUserId,
                    publish: false,
                    scheduledAt: scheduledAt

                }
            }
        )



    }



    async getInstagramContainerUnpublisheds() {

        const now = new Date()

        return this.Prisma.IntagramContainer.findMany(
            {
                where: {

                    publish: false,
                    status: true,

                    scheduledAt: {
                        lte: now
                    }
                },
            }
        )











    }

    async findAccessTokenInstagram(userId: string, provider: provider): Promise<getTokenResultType> {
        const res = await this.Prisma.integration.findUnique({
            where: {
                userId_provider: {
                    userId: userId,
                    provider: provider

                }
            }
        })

        if (!res) {
            throw new Error("MAAP ERRR")
        }

        return {
            userId: res.userId,
            provider: res.provider,
            providerAccountId: res.providerAccountId,
            id: res.id,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            createAt: res.createAt,
            updateAt: res.updateAt,


        }


    }


    async updatePublish(
        id: string,

    ) {
        return this.Prisma.IntagramContainer.update({
            where: { id },
            data: {
                publish: true,
                status: true
            }


        })
    }

    async findManyAccessTokenInstagram(userId: string[]): Promise<string[]> {
        const data = await this.Prisma.integration.findMany({
            where: {
                provider: "Instagram",
                userId: {
                    in: userId
                }

            }
        })
        return data.map((k) => k.accessToken)
    }

    async findManyContainerId(userId: string) {
        return this.Prisma.IntagramContainer.findMany({
            where: {
                userId: userId,
                status: null
            },
            select: {
                id: true,
                containerId: true,
                scheduledAt: true,
                status: true,

            },
        })
    }


    async findInstagramContainer(userId: string): Promise<instagramContainerResultType> {

        const res = await this.Prisma.IntagramContainer.findFirst({
            where: {
                userId: userId
            }
        })


        if (!res) {
            throw new BadRequestException("user not found")
        }


        return {
            userId: res.userId,
            containerId: res.containerId,
            instagramUserId: res.instagramUserId,
            status: res.status,
            publish: res.publish,
            scheduledAt: res.scheduledAt,
            createAt: res.createAt,
            updateAt: res.updateAt
        }
    }

    async saveLinkVideo({
        userId,
        videoUrl,
    }: saveLinkVideo): Promise<saveLinkVideType> {

        const response = await this.Prisma.Gallery.create({
            data: {
                userId: userId,
                videoUrl: videoUrl,
                instagram: false,
                facebook: false,
                threads: false,
                tiktok: false
            }
        })



        return {
            video: response.videoUrl,
            userId: response.userId
        }

    }

    async getLinkVideo(userId : string): Promise<getVideoLinkType> {
        const res = await this.Prisma.Gallery.findMany({
            where:{
                userId: userId
            }, 
          
        })

        const data = res.map((item) => ({
          videoUrl: item.videoUrl
        }))
 
    if(!res) {
        throw new BadRequestException("data video url not found")
    }

        return {
         
           videoUrl: data.map((item) => item.videoUrl)
        }
        
    }

}









