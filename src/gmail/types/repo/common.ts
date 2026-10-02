import { provider } from "../../../common/types"


export interface saveTokensResult {
    userId: string
    platfromUserId: string
    provider: provider
}


export interface saveTokens {
    userId: string
    provider: provider
    accessToken: string
    refreshToken: string
    platfromUserId: string

}



