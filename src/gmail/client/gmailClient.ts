import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { gmailClientPort } from "../port/gmailClientPort";
import { Apikey } from "../../common/configEnv/configEnv.service";
import { google } from "googleapis";
import { OAuth2Client} from 'google-auth-library';

@Injectable()
export class gmailClient implements gmailClientPort {

    constructor(private readonly apiKey: Apikey) {

    }

    async getOauthUrl(userId: string) {
        if (!userId) {
            throw new InternalServerErrorException(
                'User ID tidak ditemukan',
            );
        }

        const client = this.createClient();

        return client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            state: userId,

            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
        });
    }



    createClient(){
        const data = new google.auth.OAuth2(
            this.apiKey.getApikey('GMAIL_CLIENT_ID'),
            this.apiKey.getApikey('GMAIL_CLIENT_SECRET'),
            this.apiKey.getApikey('GMAIL_REDIRECT_URI'),
        );

        return data
    }

}