import { getTokenResultType, provider } from "../../instagram/types"
import { getThreadsManyContainer, saveContainerIdType } from "../types/media"
import {
  saveTokens, resultSaveTokens, saveContainerIdThreads, ContainerIdResMetaType

} from "../types/repo"

export abstract class threadsRepoPort {

  abstract saveTokens(props: saveTokens): Promise<resultSaveTokens>
  abstract findAccessTokenThreads(userId: string, provider: provider): Promise<getTokenResultType>


  abstract saveContainerId(props: saveContainerIdThreads): Promise<boolean>
  abstract getIdUser(clerkId: string): Promise<string>
  abstract updateCrossPlatfrom(id: string)
  abstract getManyAccessTokenThreads(userId: string[])
  abstract getThreadsContainerUnpublisheds(): Promise<getThreadsManyContainer[]>
  abstract updatePublish(id: string)
  
}

export const REPO_PORT = "REPO_PORT"


