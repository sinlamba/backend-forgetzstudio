import { BadRequestException, Injectable } from "@nestjs/common";
import { SaveTokensParams } from "../../common/types/tokenDataType";
import { DatabaseService } from "../../database/database.service";
import { githubRepoPort } from "../port/githubRepoPort";
import { saveTokens } from "../types/repo/common";
import axios from "axios";


@Injectable()
export class githubRepository implements githubRepoPort {

    constructor(private readonly prisma: DatabaseService) {}

    
    async saveToken({ userId, accessToken, refreshToken, provider , platfromUserId}: saveTokens) {
                
        await this.prisma.PlatformIntegration.create({
            data: {
                userId: userId,
                platform: provider,
                accessToken: accessToken,
                refreshToken: refreshToken || "",
                platformUserId: platfromUserId
            }
        })

    }

    async findUnique(userId: string, provider: string) {
        return await this.prisma.PlatformIntegration.findUnique({
            where: {
                userId_platform: {
                    userId: userId,
                    platform: provider

                }
            }
        })
    }

  async getIdUser(clerkId: string): Promise<string> {
         
        const responseId = await this.prisma.user.findUnique({
            where: {
                clerkId: clerkId
            }
        })

          if(!responseId) {
            throw new BadRequestException("id user not found")
          }

        return responseId?.id
        
    }

//     async getValidAccessToken(userId: string) {
//     const integration =
//         await this.repository.findGithubIntegration(
//             userId
//         );

//     if (!integration) {
//         throw new UnauthorizedException(
//             "Github account not connected"
//         );
//     }

//     const now = new Date();

//     if (
//         integration.accessTokenExpiresAt &&
//         integration.accessTokenExpiresAt > now
//     ) {
//         return integration.accessToken;
//     }

//     if (!integration.refreshToken) {
//         throw new UnauthorizedException(
//             "Github refresh token not available"
//         );
//     }

//     const token =
//         await this.githubClient.refreshAccessToken(
//             integration.refreshToken
//         );

//     await this.repository.updateTokens(
//         integration.id,
//         {
//             accessToken: token.access_token,

//             refreshToken:
//                 token.refresh_token,

//             accessTokenExpiresAt:
//                 new Date(
//                     Date.now() +
//                     token.expires_in * 1000
//                 ),

//             refreshTokenExpiresAt:
//                 new Date(
//                     Date.now() +
//                     token.refresh_token_expires_in * 1000
//                 ),
//         }
//     );

//     return token.access_token;
// }






}