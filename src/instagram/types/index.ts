import { provider } from "../../common/types"


export interface accessTokenResult<T> {
    success: boolean,
    data: T[]
}


export interface createIgContainerId {
    caption: string
    userId:string
    platfromUserId: string
    audioName: string
    accessToken: string
    videoUrl: string
    scheduledAt: Date | null
}

export interface saveContainerId {
    userId: string
    containerId: string
    platform:provider
    platformUserId: string
    publish: boolean | null
    scheduledAt: Date
}


export interface containerResultType {
    id: string
}





export interface publishExecType {
    instagramUserId: string,
    containerId: string,
    accessToken: string,
}


export interface saveTokenInstagramResult {
    userId: string;
    platform: string | null;
    platformUserId: string | null;
    accessToken: string;
    refreshToken: string | null;
    createAt: Date;
    updateAt: Date;
}



export * from "./repository"
export * from "./client"