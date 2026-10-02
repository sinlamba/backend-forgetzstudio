import { Injectable, UnauthorizedException } from "@nestjs/common";
import { githubClientPort } from "../port/githubClientPort";
import { Apikey } from "../../common/configEnv/configEnv.service";
import { json } from "zod";



@Injectable()
export class githubClient implements githubClientPort {


    constructor(private readonly apiKey: Apikey) { }

    getUrlOauth(): string {
        const clientId = this.apiKey.getApikey("GITHUB_CLIENT_ID")

        const params = new URLSearchParams({
            client_id: clientId,
            scope: "repo user:email offline_access"
        })

        const url = `https://github.com/login/oauth/authorize?${params.toString()}`
        return url
    }
    async exchangeCodeForToken(code: string) {
        const response = await fetch(
            "https://github.com/login/oauth/access_token",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    client_id: this.apiKey.getApikey(
                        "GITHUB_CLIENT_ID"
                    ),

                    client_secret: this.apiKey.getApikey(
                        "GITHUB_CLIENT_SECRET"
                    ),

                    code,

                    grant_type: "authorization_code",
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `GitHub OAuth failed: ${response.status}`
            );
        }

        return response.json();
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
    async convertAccessToken(refreshToken: string) {

        const response = await fetch("https://github.com/oatuh/access_token",
            {
                method: "POST",
                headers: {
                    "Authorization": `bearer ${refreshToken}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    clientId: this.apiKey.getApikey("GITHUB_CLIENT_ID"),
                    secretKey: this.apiKey.getApikey("GITHUB_SECRET_KEY")
                })
            }
        )


        if (!response.ok) {
            throw new UnauthorizedException("refresh token is invalid")
        }

        return response.json()
    }


}