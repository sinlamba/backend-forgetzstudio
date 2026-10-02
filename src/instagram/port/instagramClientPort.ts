import { createIgContainerId, containerResultType, instagramContainerResultType } from "../types"
import { InstagramMediaResponse } from "../types/mediaType"



export const CLIENT_PORT = Symbol("CLIENT_PORT")

export interface InstagramClientPort {
    createContainerId({ platfromUserId,
        videoUrl,
        caption,
        accessToken,
        audioName,
    }: createIgContainerId): Promise<containerResultType>
 
        refreshAccessToken(
    accessToken: string,
  ): Promise<{
    accessToken: string;
    expiresIn: number;
  }>;
    // getInstagramContainerId(userId: string) 

    getInstagramContainer(userId: string)
     
    findInstagramContainer(userId: string): Promise<instagramContainerResultType[]>
     getMedia(accessToken: string): Promise<InstagramMediaResponse>
    getProfile(accessToken: string)
    // createInstagramPost(accessToken: string): Promise<containerResultType>
    



}