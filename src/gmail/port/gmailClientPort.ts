



export const CLIENT_PORT = "CLIENT_PORT"

export abstract class gmailClientPort {

    abstract getOauthUrl(userId: string)

    abstract createClient()
}


