import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { getTokenResultType, getVideoLinkType, instagramContainerResultType,provider,saveContainerId, saveInstagramAccessToken, saveLinkVideo, saveLinkVideType, saveTokenInstagramResult } from "../types";
import { InstagramRepoPort } from "../port/instagramRepoPort";



@Injectable()
export class InstagramRepository implements InstagramRepoPort {


    constructor(private readonly Prisma: DatabaseService) { }

    async getUserId(clerkId: string): Promise<string> {
        const response = await this.Prisma.user.findUnique({
            where: {
                clerkId: clerkId
            }
        })
        if (!response?.id) throw new BadRequestException("notfound")


        return response?.id
    }

    async getUserCrossPlatfrom(
        clerkId: string
    ): Promise<string[]> {

        const data = await this.Prisma.user.findUnique({
            where: {
                id: clerkId
            },
            select: {
                crossPlatfrom: true
            }
        })

        if (!data) {
            throw new BadRequestException("User not found")
        }

        return data.crossPlatfrom
    }



    async saveTokensInstagram({ userId, access_token, platform, platformUserId, refreshToken, expiresAt }: saveInstagramAccessToken): Promise<saveTokenInstagramResult> {

        return this.Prisma.PlatformIntegration.create({
            data: {
                userId: userId,
                accessToken: access_token,
                platform: platform,
                expiresAt: expiresAt,
                refreshToken: refreshToken,
                platformUserId: platformUserId,

            }
        })








    }

    async saveContainerId({ userId, containerId, platformUserId, scheduledAt, platform }: saveContainerId) {

        return await this.Prisma.ContainerId.create(
            {
                data: {
                    userId,
                    platform: platform,
                    containerId,
                    platformUserId,
                    publish: false,
                    scheduledAt: scheduledAt

                }
            }
        )



    }

    async getInstagramContainerUnpublisheds() {
        const now = new Date();

        return this.Prisma.ContainerId.findMany({
            where: {
                platform:"Instagram",
                publish: false,
                scheduledAt: {
                    lte: now,
                },
            },
        });
    }
    async findAccessTokenInstagram(userId: string, platform: provider): Promise<getTokenResultType> {
        const res = await this.Prisma.PlatformIntegration.findUnique({
            where: {
                  userId_platform: {
                    userId: userId,
                    platform: platform

                }
            }
        })

        if (!res) {
            throw new Error("MAAP ERRR")
        }

        return {
            userId: res.userId,
            platform: res.platform || "",
            platformUserId: res.platformUserId!,
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
        return this.Prisma.ContainerId.update({
            where: { id },
            data: {
                publish: true,

            }


        })
    }

    async findManyAccessTokenInstagram(userId: string[]) {
        const data = await this.Prisma.PlatformIntegration.findMany({
            where: {
                platform: "Instagram",
                userId: {
                    in: userId
                }

            }
        })

        return data

    }

    async findManyContainerId(userId: string) {
        return this.Prisma.ContainerId.findMany({
            where: {
                userId: userId,

            },
            select: {
                id: true,
                containerId: true,
                scheduledAt: true,


            },
        })
    }


    async findInstagramContainer(userId: string): Promise<instagramContainerResultType[]> {

        const res = await this.Prisma.ContainerId.findMany({
            where: {
                userId: userId
            }
        })


        if (res.length === 0) {
            throw new BadRequestException("user not found")
        }


        return res
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

    async getLinkVideo(userId: string): Promise<getVideoLinkType> {
        const res = await this.Prisma.Gallery.findMany({
            where: {
                userId: userId
            },

        })

        const data = res.map((item) => ({
            videoUrl: item.videoUrl
        }))

        if (!res) {
            throw new BadRequestException("data video url not found")
        }

        return {

            videoUrl: data.map((item) => item.videoUrl)
        }

    }


    async updateCrossPlatfrom(id: string, platform: string) {
        const user = await this.Prisma.user.findUnique({
            where: {
                id
            },
            select: {
                crossPlatfrom: true
            }
        })

        if (!user) {
            throw new BadRequestException("User not found")
        }

        if (user.crossPlatfrom.includes(platform)) {
            return user.crossPlatfrom
        }

        return this.Prisma.user.update({
            where: {
                id
            },
            data: {
                crossPlatfrom: {
                    push: platform
                }
            },
            select: {
                crossPlatfrom: true
            }
        })
    }
}









