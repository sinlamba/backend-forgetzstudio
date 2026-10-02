
export type provider = "Instagram" | "Threads" | "Tiktok" | "Facebook"

interface saveTokens {
    id: string
    expired: Date
    provider: provider
    providerAccountId: string
    accessToken: string
    refreshToken: string
}

interface resultSaveTokens {
    userId: string
    expired: Date
    provider: string
    platfromAccountId: string
    accessToken: string
    refreshToken: string
}

interface getAccessTokenResultType {
    userId: string
    provider: provider
    accessToken: string
}

interface saveContainerIdThreads {
    userId: string
    containerId: string
    platfrom:provider
    platfromAccountId: string
    publish: boolean | null
    scheduledAt: Date
}

interface ContainerIdResMetaType {
    id: string
}




export type { ContainerIdResMetaType, resultSaveTokens, saveTokens, saveContainerIdThreads }
