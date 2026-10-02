


export type provider = "Instagram" | "Github" | "Gmail" | "Tiktok" | "Whatsapp" | "Telegram " | "Threads"

export interface getTokenResultType {
    userId: string;
    provider: string;
    platfromAccountId: string | null;
    id: string;
    accessToken: string;
    refreshToken: string | null;
    createAt: Date;
    updateAt: Date;
}


export interface saveInstagramAccessToken {
    userId: string

    access_token: string
    refreshToken: string
    expiresAt: Date
    provider: provider
    platfromAccountId: string
}


export interface instagramContainerResultType {
    userId: string
    containerId: string
    platfromUserId: string

    publish: boolean | null
    scheduledAt: Date | null
    createAt: Date | null;
    updateAt: Date | null;
}


export interface saveLinkVideType {
    userId: string
    video: string
}

export interface saveLinkVideo {
    userId: string
    videoUrl: string
}

export interface getVideoLinkType {
    videoUrl: string[]
}


export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS' | 'STORIES';
