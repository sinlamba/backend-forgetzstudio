

export interface accessTokenResult<T> {
    success: boolean,
    data: T[]
}


export interface containerId {
    caption: string
    instagramUserId: string
    audioName: string
    accessToken: string
    videoUrl: string
  scheduledAt: Date
}

export interface saveContainerId {
    userId: string
    containerId: string
    instagramUserId: string
    publish: boolean | null
    scheduledAt: Date
}


export interface containerResultType {
    id: string
}





export interface publishExecType {
    instagramUserId: string,
    containerId: string,
    accessToken: string[],
}


export interface saveTokenInstagramResult {
    userId: string;
    provider: string;
    providerAccountId: string | null;
    id: string;
    accessToken: string;
    refreshToken: string | null;
    createAt: Date;
    updateAt: Date;
}



export * from "./repository"
export * from "./client"