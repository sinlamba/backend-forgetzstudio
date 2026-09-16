import { containerId, containerResultType, instagramContainerResultType } from "../types"
import { InstagramMediaResponse } from "../types/mediaType"



export const INSTAGRAM_PORT = Symbol("INSTAGRAM_PORT")


export interface InstagramPort {
    createContainerId({ instagramUserId,
        videoUrl,
        caption,
        accessToken,
        audioName,
    }: containerId): Promise<containerResultType>
 
      
    // getInstagramContainerId(userId: string) 

    getInstagramContainer(userId: string)
     
    findInstagramContainer(userId: string): Promise<instagramContainerResultType>
     getMedia(accessToken: string): Promise<InstagramMediaResponse>
    getProfile(accessToken: string)
    // createInstagramPost(accessToken: string): Promise<containerResultType>
    



}