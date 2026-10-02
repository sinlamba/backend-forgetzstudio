import { SaveTokensParams } from "../../common/types/tokenDataType";


export abstract class githubRepoPort {


    abstract saveToken({ userId, accessToken, refreshToken }: SaveTokensParams): Promise<void>
    abstract findUnique(userId: string, provider: string)
    abstract getIdUser(clerkId: string): Promise<string>

}

export const REPO_PORT = "REPO_PORT"