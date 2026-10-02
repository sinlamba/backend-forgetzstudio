import {
  BadRequestException,
  Injectable,
  BadGatewayException,
} from '@nestjs/common';
import { FacebookClientPort } from '../port/facebookClientPort';
import { Apikey } from '../../common/configEnv/configEnv.service';
import { OAuthProvider } from '../../instagram/auth/oAuthProvider';

type ConfigFb = {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scope: string;
};

@Injectable()
export class FacebookClient {


  constructor(private readonly apiKey: Apikey) {
  
  }

  private getOAuthProvider(): OAuthProvider {
    const clientId =
      this.apiKey.getApikey('FACEBOOK_APP_ID');

    const clientSecret =
      this.apiKey.getApikey('FACEBOOK_SECRET_KEY');

    const redirectUri =
      this.apiKey.getApikey('FACEBOOK_REDIRECT_URI');

    if (!clientId) {
      throw new BadRequestException(
        'FACEBOOK_APP_ID is not configured',
      );
    }

    if (!clientSecret) {
      throw new BadRequestException(
        'FACEBOOK_SECRET_KEY is not configured',
      );
    }

    if (!redirectUri) {
      throw new BadRequestException(
        'FACEBOOK_REDIRECT_URI is not configured',
      );
    }

    return new OAuthProvider({
      loginType: 'facebook',
      clientId,

      clientSecret,
      redirectUri,

    });
  }

getLoginUrl(userId: string): string {
  if (!userId) {
    throw new BadRequestException(
      'userId is required',
    );
  }

  const oauth = this.getOAuthProvider();

  const authUrl = oauth.getAuthorizationUrl({
    state: userId,
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
    ],
  });

  return authUrl;
}

}