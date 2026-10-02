import { containerResultType, ProfileFields } from "../types";
import { TokenResponse } from "../types/auth";
import { createThreadsContainerId, mediaPublishResultType, mediaPublishType, MediaType } from "../types/media";

export abstract class ThreadsClientPort {
     abstract exchangeCodeForToken(code: string): Promise<TokenResponse>

     abstract getUserProfile({
          userId,
          fields,
     }: {
          userId: string;
          fields: ProfileFields[];
     }): Promise<ProfileFields[]>

     abstract getAuthorizationUrl(state?: string): string


     abstract getLongLivedToken(shortLivedToken: string): Promise<TokenResponse>


     abstract refreshLongLivedToken(longLivedToken: string, ): Promise<TokenResponse>

     abstract createMediaContainer({
          userId,
          mediaType,
          mediaUrl,
          text,
          accessToken
     }: createThreadsContainerId ): Promise<containerResultType>

     // publishMedia Contract 
    abstract publishMediaContainer({
      creationId,
      userId,
      accessToken
    }:mediaPublishType): Promise<mediaPublishResultType>
     abstract   refreshAccessToken(
    accessToken: string,
  ): Promise<{
    accessToken: string;
    expiresIn: number;
  }>;
}


export const CLIENT_PORT = "CLIENT_PORT"