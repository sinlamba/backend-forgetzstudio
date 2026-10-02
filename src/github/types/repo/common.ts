export type provider = "Instagram" | "Github" | "Gmail" | "Tiktok" | "Whatsapp" | "Telegram " | "Threads"

export interface saveTokens {
    userId: string
    provider: provider
    accessToken: string
    refreshToken: string
    platfromUserId: string

}