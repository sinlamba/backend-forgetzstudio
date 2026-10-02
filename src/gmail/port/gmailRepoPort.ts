import { provider } from "../../common/types";
import { saveTokens, saveTokensResult } from "../types/repo/common";




export abstract class gmailRepoPort {
    abstract saveTokens(props: saveTokens): Promise<saveTokensResult>

    abstract findUnique(id:string, provider:provider)
      abstract getUserId(clerkId: string): Promise<string>

}


export const REPO_PORT = "REPO_PORT"