import { convertNumberToDate } from "../../common/utils/convertNumberToDate";
import { createIgContainerId, saveContainerId } from "../../instagram/types";
import { TokenResponse } from "../types/auth";
import { createThreadsContainerId } from "../types/media";
import { saveContainerIdThreads, saveTokens } from "../types/repo";




export class MappersThreadsGlobal {
    static async acessTokenToSaveToken(props: TokenResponse, props2: saveTokens): Promise<saveTokens> {

        return {
            id: props2.id,
            accessToken: props.access_token,
            provider: "Threads",
            providerAccountId: props2.providerAccountId,
            expired: convertNumberToDate(props.expires_in),
            refreshToken: props2.refreshToken
        }

    }

    static async SaveContainerId(props: saveContainerId): Promise<saveContainerIdThreads> {



        return {
            userId: props.userId,
            platfrom: "Threads",
            platfromAccountId: props.platfromUserId,
            publish: false,
            scheduledAt: props.scheduledAt,
            containerId: props.containerId!

        }

    }


static instagramContainerToThreads(
    props: createIgContainerId
): createThreadsContainerId {
    return {
        userId: props.platfromUserId,
        accessToken: props.accessToken,
        mediaUrl: props.videoUrl,
        text: props.caption,
        mediaType: "VIDEO",
    }
}

} 
