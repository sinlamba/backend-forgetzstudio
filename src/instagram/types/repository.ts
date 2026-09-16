


export type provider = "Instagram" | "Github" | "Gmail" | "Tiktok" | "Whatsapp" | "Telegram"

export interface getTokenResultType {
    userId: string;
    provider: string;
    providerAccountId: string | null;
    id: string;
    accessToken: string;
    refreshToken: string | null;
    createAt: Date;
    updateAt: Date;
}


export interface saveInstagramAccessToken {
    userId: string
    access_token: string
    provider: provider
    providerAccountId: string
}


export interface instagramContainerResultType {
    userId: string
    containerId: string
    instagramUserId: string
    status: boolean | null
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
