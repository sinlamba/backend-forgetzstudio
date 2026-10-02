import { getVideoLinkType, saveContainerId, saveInstagramAccessToken, saveLinkVideo, saveLinkVideType, saveTokenInstagramResult } from "../types";


export abstract class InstagramRepoPort {

    abstract saveTokensInstagram({ userId, access_token, provider, platfromAccountId, refreshToken, expiresAt }: saveInstagramAccessToken): Promise<saveTokenInstagramResult>

    abstract saveLinkVideo({
        userId,
        videoUrl,
    }: saveLinkVideo): Promise<saveLinkVideType>

    abstract getLinkVideo(userId: string): Promise<getVideoLinkType>
    abstract getUserId(clerkId: string): Promise<string>
    abstract updateCrossPlatfrom(id: string, platform: string)
    abstract getUserCrossPlatfrom(
        clerkId: string
    ): Promise<string[]>
    abstract getInstagramContainerUnpublisheds()
abstract saveContainerId({ userId, containerId, platfromUserId, scheduledAt, platfrom }: saveContainerId)
}

export const REPO_PORT = Symbol("REPO_PORT")