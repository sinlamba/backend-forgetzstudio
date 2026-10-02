import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CLIENT_PORT, ThreadsClientPort } from './port/threadsClientPort';
import { MappersThreadsGlobal } from './mappers/threads.mapper';
import { convertNumberToDate } from '../common/utils/convertNumberToDate';
import { createThreadsContainerId, mediaPublishResultType, mediaPublishType, publishExecType, publishMediaType } from './types/media';
import { REPO_PORT, threadsRepoPort } from './port/threadsRepoPort';
import { provider } from '../instagram/types';
import { Cron } from '@nestjs/schedule';
import { Apikey } from '../common/configEnv/configEnv.service';
import axios from 'axios';
type AccessTokenResult = {
    userId: string;
    accessToken: string;
};
@Injectable()
export class ThreadsService {
    private isPublishing = false;
    constructor(

        // hxg pattern done
        @Inject(CLIENT_PORT)
        private readonly ThreadsClient: ThreadsClientPort,

        @Inject(REPO_PORT)
        private readonly ThreadsRepo: threadsRepoPort,

        private readonly apiKey: Apikey,


    ) { }


    getUrl(state: string) {
        return this.ThreadsClient.getAuthorizationUrl(state)
    }

    async getUser(clerkId: string) {
        return this.ThreadsRepo.getIdUser(clerkId)
    }

    //  logic Oauth and excahnge tokens
    async exchangeCodeForToken(state: string, code: string) {


        const accessToken = await this.ThreadsClient.exchangeCodeForToken(code)


        const longLivedToken =
            await this.ThreadsClient.getLongLivedToken(
                accessToken.access_token,

            );


        const refreshToken = await this.ThreadsClient.refreshLongLivedToken(longLivedToken.access_token)

        const data = await MappersThreadsGlobal.acessTokenToSaveToken(longLivedToken, {
            id: state,
            provider: "Threads",
            providerAccountId: String(accessToken.user_id),
            expired: convertNumberToDate(longLivedToken.expires_in),
            refreshToken: refreshToken.access_token,
            accessToken: longLivedToken.access_token
        })


        const saveTokens = await this.ThreadsRepo.saveTokens(data)



        return {
            success: Boolean(saveTokens),
            messages: "data anda berhasil disimpan"

        }


    }
    async getAcessToken(userId: string, provider: provider) {
        return this.ThreadsRepo.findAccessTokenThreads(userId, provider)
    }

    // check connection 
    async CheckConnectionThreads(userId: string, provider: provider) {
        return this.ThreadsRepo.findAccessTokenThreads(
            userId,
            provider
        )
    }


    //  createContainerSession
    async createContainerId(props: createThreadsContainerId, { scheduleAt, userId }: {
        scheduleAt: Date,
        userId: string
    }) {

        // ini function numpang yah untuk cari aja providerUserId
        const platfromUserId = await this.ThreadsRepo.findAccessTokenThreads(userId, "Threads")
        if (!platfromUserId.platfromAccountId) {
            throw new BadRequestException("threads userId not found")
        }
        // ini function numpang yah untuk cari aja providerUserId

        const results = await this.ThreadsClient.createMediaContainer(props)

 await this.ThreadsRepo.saveContainerId({
            userId: userId,
            platfrom: "Threads",
            containerId: results.id,
            platfromAccountId: platfromUserId.platfromAccountId,
            scheduledAt: scheduleAt,
            publish: false
        })

        return results
    }


    async getContainerIdByUserId() {

    }



    async publishExec({
        threadsUserId,
        containerId,
        accessToken,
    }: publishExecType) {
        const baseUrl =
            this.apiKey.getApikey("THREADS_BASE_URL");

        const url =
            `${baseUrl}${threadsUserId}/threads_publish`;


        const response = await axios.post(
            url,
            {
                creation_id: containerId,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );

        return response.data;
    }
    @Cron("* * * * *")
    async threadsCronJob() {

        if (this.isPublishing) {
            console.log("Publish masih berjalan, skip cron.");
            return;
        }
        this.isPublishing = true;
        try {
            const containers =
                await this.ThreadsRepo.getThreadsContainerUnpublisheds();

            if (!containers.length) {
                return;
            }

            console.log(
                `Found ${containers.length} unpublished Threads containers`,
            );

            const userIds = [
                ...new Set(
                    containers.map((item) => item.userId),
                ),
            ];

            const findTokens =
                await this.ThreadsRepo.getManyAccessTokenThreads(
                    userIds,
                );

            console.log(
                `Found ${findTokens.length} Threads access tokens`,
            );

            const tokenMap = new Map<string, string>(
                findTokens.map((token: AccessTokenResult) => [
                    token.userId,
                    token.accessToken,
                ]),
            );

            for (const post of containers) {
                const accessToken =
                    tokenMap.get(post.userId);

                if (!accessToken) {
                    console.error(
                        `Access token tidak ditemukan untuk user ${post.userId}`,
                    );

                    continue;
                }

                try {
                    console.log(
                        `Publishing Threads container ${post.containerId}...`,
                    );

                    const postData =
                        await this.publishExec({
                            threadsUserId:
                                post.platfromUserId,
                            containerId:
                                post.containerId,
                            accessToken,
                        });

                    if (!postData) {
                        console.error(
                            `Gagal publish Threads container ${post.containerId}`,
                        );

                        continue;
                    }

                    const update =
                        await this.ThreadsRepo.updatePublish(
                            post.id,
                        );

                    console.log(
                        `Threads container ${post.containerId} berhasil dipublish`,
                    );

                    console.log(
                        "Database updated:",
                        update.id,
                    );
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error(
                            `Threads API error untuk container ${post.containerId}`,
                        );

                        console.error(
                            "Status:",
                            error.response?.status,
                        );

                        console.error(
                            "Response:",
                            error.response?.data,
                        );
                    } else {
                        console.error(
                            `Error publish Threads container ${post.containerId}:`,
                            error,
                        );
                    }
                }
            }
        } catch (error) {
            console.error(
                "Threads publish cron error:",
                error,
            );
        } finally {

            this.isPublishing = false;

        }
    }

    async updateCrossPlatfrom(id: string) {

        return this.ThreadsRepo.updateCrossPlatfrom(id)
    }




}
