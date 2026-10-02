
import { threadsRepoPort } from "../port/threadsRepoPort";
import { saveTokens, resultSaveTokens, saveContainerIdThreads, ContainerIdResMetaType } from "../types/repo";
import { DatabaseService } from "../../database/database.service";

import { BadRequestException, Injectable } from "@nestjs/common";
import { getTokenResultType, provider } from "../../instagram/types";
import { getThreadsManyContainer } from "../types/media";

@Injectable()
export class threadsRepository implements threadsRepoPort {

    constructor(private readonly Prisma: DatabaseService) { }

    async saveTokens(props: saveTokens): Promise<resultSaveTokens> {

        const res = await this.Prisma.PlatfromIntegration.create({
            data: {
                userId: props.id,
                accessToken: props.accessToken,
                provider: props.provider,
                expiresAt: props.expired,
                refreshToken: props.refreshToken,
                platfromAccountId: props.providerAccountId

            }
        })




        return {
            userId: res.userId,
            accessToken: res.accessToken,
            provider: res.provider!,
            expired: res.expiresAt!,
            refreshToken: res.refreshToken!,
            platfromAccountId: res.platfromAccountId!
        }


    }



    async findAccessTokenThreads(userId: string, provider: provider): Promise<getTokenResultType> {
        const res = await this.Prisma.PlatfromIntegration.findUnique({
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
            provider: res.provider || "",
            platfromAccountId: res.platfromAccountId,
            id: res.id,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            createAt: res.createAt,
            updateAt: res.updateAt,


        }


    }

    async saveContainerId(props: saveContainerIdThreads): Promise<boolean> {

        const res = await this.Prisma.ContainerId.create({
            data: {
                userId: props.userId,
                platfrom: props.platfrom,
                containerId: props.containerId,
                platfromUserId: props.platfromAccountId,
                publish: false,
                scheduledAt: props.scheduledAt


            }
        })

        return Boolean(res.id)
    }

    async getIdUser(clerkId: string): Promise<string> {

        const responseId = await this.Prisma.user.findUnique({
            where: {
                clerkId: clerkId
            }
        })

        if (!responseId) {
            throw new BadRequestException("id user not found")
        }

        return responseId?.id

    }

    async updateCrossPlatfrom(id: string) {
        const data = await this.findUserHelper(id)

        return this.Prisma.user.update({
            where: {
                id: id
            },
            data: {
                ...data,
                crossPlatfrom: [
                    ...(data?.crossPlatfrom ?? []),
                    "Threads"
                ]
            }
        })
    }

    private findUserHelper(id: string) {
        return this.Prisma.user.findUnique(
            {
                where: {
                    id: id
                }
            }
        )
    }

    async getManyAccessTokenThreads(userId: string[]) {
        const data = await this.Prisma.PlatfromIntegration.findMany({
            where: {
                provider: "Threads",
                userId: {
                    in: userId
                }

            }
        })

        return data
    }

    async getThreadsContainerUnpublisheds(): Promise<getThreadsManyContainer[]> {
        const now = new Date();

        const data = await this.Prisma.ContainerId.findMany({
            where: {
                platfrom:"Threads",
                publish: false,
                scheduledAt: {
                    lte: now,
                },
          
            },
        });

        return data;
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

}