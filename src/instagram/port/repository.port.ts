import { getVideoLinkType, saveInstagramAccessToken, saveLinkVideo, saveLinkVideType, saveTokenInstagramResult } from "../types";


export abstract class RepositoryPort {

    abstract saveTokensInstagram({ userId, access_token, provider, providerAccountId }: saveInstagramAccessToken): Promise<saveTokenInstagramResult>

    abstract saveLinkVideo({
        userId,
        videoUrl,
        }: saveLinkVideo): Promise<saveLinkVideType>

         abstract getLinkVideo(userId : string): Promise<getVideoLinkType>

   


}

export const REPO_PORT = Symbol("REPO_PORT")