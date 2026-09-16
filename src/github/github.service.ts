import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Apikey } from '../common/configEnv/configEnv.service';
import { URLSearchParams } from 'url';
import { DatabaseService } from '../database/database.service';
import { PrismaHelper } from '../common/utils/prismaPattern';
import { SaveTokensParams } from '../common/types/tokenDataType';



@Injectable()
export class GithubService {

    constructor(private readonly apiKey: Apikey, private prisma: PrismaHelper) { }

    getSignUrl() {
        const clientId = this.apiKey.getApikey("GITHUB_CLIENT_ID")

        const params = new URLSearchParams({
            client_id: clientId,
            scope: "user:read user:email repo"
        })


        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string) {


        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                client_id: this.apiKey.getApikey("GITHUB_CLIENT_ID"),
                client_secret: this.apiKey.getApikey("GITHUB_CLIENT_SECRET"),
                code


            })
        })



        return response.json()

    }

    async getGithubUser(token: string) {
        const response = await fetch("https://api.github.com/user",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    accept: "application/vnd.github+json",


                },
            }
        )


        return response.json()
    }


    async saveTokens({ userId, accessToken, refreshToken }: SaveTokensParams) {
        return await this.prisma.saveTokens({
            userId,
            accessToken,
            refreshToken,
            providersParams: "Github",
        })
    }


    async getTokenFromDb(userId: string) {
        return await this.prisma.FindUnique(
            userId,
            "Github"
        )
    }





}
