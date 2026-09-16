
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import {

  OAuthProvider,
} from './auth/oAuthProvider';

import { Apikey } from '../common/configEnv/configEnv.service';
import { containerId, getTokenResultType, provider, saveInstagramAccessToken, saveLinkVideo } from './types';
import { InstagramRepository } from './repository/instagram.repo';
import { InstagramClient } from './client/instagram.client';
import type { InstagramPort } from './port/instagram.port';
import { INSTAGRAM_PORT } from './port/instagram.port';
import { REPO_PORT, RepositoryPort } from './port/repository.port';

@Injectable()
export class InstagramService {
  constructor(
    private readonly apiKey: Apikey,
    private readonly instagramRepostiroy: InstagramRepository,
    private readonly instagramClient: InstagramClient,


    // DEPEDENCY INJECTION INVERSION
    @Inject(INSTAGRAM_PORT)
    private readonly instagramClients: InstagramPort,



    @Inject(REPO_PORT)
    private readonly instagramRepositorys: RepositoryPort

  ) { }


  private getOAuthProvider(): OAuthProvider {
    const clientId =
      this.apiKey.getApikey('INSTAGRAM_APP_ID');

    const clientSecret =
      this.apiKey.getApikey('INSTAGRAM_APP_SECRET');

    const redirectUri =
      this.apiKey.getApikey('INSTAGRAM_REDIRECT_URI');

    if (!clientId) {
      throw new BadRequestException(
        'INSTAGRAM_APP_ID is not configured',
      );
    }

    if (!clientSecret) {
      throw new BadRequestException(
        'INSTAGRAM_APP_SECRET is not configured',
      );
    }

    if (!redirectUri) {
      throw new BadRequestException(
        'INSTAGRAM_REDIRECT_URI is not configured',
      );
    }

    return new OAuthProvider({
      loginType: 'instagram',
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
    });


    return authUrl;
  }

  async callback(code: string, state: string) {
    if (!code) {
      throw new BadRequestException(
        'Instagram authorization code is missing',
      );
    }

    if (!state) {
      throw new BadRequestException(
        'userid dari clerk itu hilang mas hehe',
      );
    }

    const oauth = this.getOAuthProvider();

    const shortLived =
      await oauth.exchangeCodeForToken(code);

    if (!shortLived?.access_token) {
      throw new BadRequestException(
        'Instagram short-lived access token was not returned',
      );
    }

    const longLived =
      await oauth.exchangeForLongLivedToken(
        shortLived.access_token,
      );

    if (!longLived?.access_token) {
      throw new BadRequestException(
        'Instagram long-lived access token was not returned',
      );
    }

    const profile =
      await this.instagramClient.getProfile(
        longLived.access_token,
      );

    return {
      userId: state,
      instagramUserId: profile.user_id,
      username: profile.username,
      accountType: profile.account_type,
      accessToken: longLived.access_token,
      expiresIn: longLived.expires_in ?? null,
    };
  }

  // DONE MIGRATE TO HXG PTRN
  async saveTokens({ userId, access_token, provider, providerAccountId }: saveInstagramAccessToken) {


    return await this.instagramRepositorys.saveTokensInstagram(
      {
        userId,
        access_token,
        provider,
        providerAccountId
      }
    )



  }

  webHooks(
    mode: string,
    challenge: string,
    token: string,
  ) {
    const verifyToken =
      this.apiKey.getApikey(
        'INSTAGRAM_VERIFY_TOKEN',
      );

    if (
      mode === 'subscribe' &&
      token === verifyToken
    ) {
      return challenge;
    }

    throw new ForbiddenException(
      'Invalid Instagram webhook verify token',
    );
  }

  async handleWebhook(body: any) {

    console.dir(body, {
      depth: null,
    });



    return {
      received: true,
    };
  }


  async getAccessToken(userId: string, provider: provider) {
    return await this.instagramRepostiroy.findAccessTokenInstagram(userId, provider)
  }



  async createContainer(userId: string,
    props: containerId) {

    const responseContainer = await this.instagramClients.createContainerId(props)

    if (!responseContainer.id) {
      throw new BadRequestException("container id fail create")
    }




    const result = {
      userId: userId,
      containerId: responseContainer.id,
      instagramUserId: props.instagramUserId,
      publish: false,
      scheduledAt: props.scheduledAt
    }



    await this.instagramRepostiroy.saveContainerId(result)


    return responseContainer

  }


  async getInstagramContainer(userId: string) {
    const response =
      await this.instagramRepostiroy.findManyContainerId(userId);

    const result: string[] = [];

    for (const item of response) {
      result.push(item.containerId);
    }

    return result;
  }





  async getDataContainerStatus(userId: string) {
    return this.instagramClients.getInstagramContainer(userId)
  }

  async userInstagramContainer(userId: string) {

    return await this.instagramClients.findInstagramContainer(userId)

  }

  async saveVideoUrl(props: saveLinkVideo) {
    return this.instagramRepositorys.saveLinkVideo(props)
  }

  async getLinkVideoUrl(userId: string) {
    return this.instagramRepositorys.getLinkVideo(userId)
  }
async getProfile(userId: string) {
    const userData = await this.getAccessToken(
        userId,
        "Instagram",
    );

    if (!userData?.accessToken) {
        throw new Error("Instagram access token not found");
    }

    const media = await this.instagramClients.getMedia(
        userData.accessToken,
    );



    const profile = await this.instagramClients.getProfile(
        userData.accessToken,
    );

    return {
        profile,
        media,
    };
}



}

