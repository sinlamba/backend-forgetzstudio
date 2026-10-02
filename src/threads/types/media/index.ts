

export type MediaType = "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL";

export interface containerResultType {
    id: string
}

export interface publishMediaType extends containerResultType { }

export interface createThreadsContainerId {
    accessToken: string
    userId: string;
    mediaType: MediaType;
    mediaUrl?: string;
    text?: string;
}


export interface saveContainerIdType {
    userId: string
    plafromUserId: string
    containerId: string
    publish: boolean
    schedule: Date | null
}



export interface mediaPublishType {
    userId : string
    creationId: string
    accessToken: string
}

export interface mediaPublishResultType {
    id: string
}

export type publishExecType = {
    threadsUserId: string;
    containerId: string;
    accessToken: string;
};

export type getThreadsManyContainer = {
     userId: string;
    containerId: string;
    id: string;
    platfromUserId: string;
    createAt: Date;
    updateAt: Date;
    platfrom: string;
    publish: boolean | null;
    scheduledAt: Date | null;
}


