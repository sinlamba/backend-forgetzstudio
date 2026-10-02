

export const CLIENT_PORT = "CLIENT_PORT"
export abstract class githubClientPort {

    abstract getUrlOauth(): string
    abstract exchangeCodeForToken(code: string)
    abstract getGithubUser(token: string)
}