
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
import { createIgContainerId, getTokenResultType, provider, saveContainerId, saveInstagramAccessToken, saveLinkVideo } from './types';
import { InstagramRepository } from './repository/instagramRepo';
import { InstagramClient } from './client/instagramClient';
import { CLIENT_PORT, type InstagramClientPort } from './port/instagramClientPort';
import { InstagramRepoPort, REPO_PORT } from './port/instagramRepoPort';


@Injectable()
export class InstagramService {
  constructor(
    private readonly apiKey: Apikey,
    private readonly instagramRepostiroy: InstagramRepository,
    private readonly instagramClient: InstagramClient,


    // DEPEDENCY INJECTION INVERSION
    @Inject(CLIENT_PORT)
    private readonly instagramClients: InstagramClientPort,



    @Inject(REPO_PORT)
    private readonly instagramRepositorys: InstagramRepoPort,


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
      scopes: [
        "instagram_business_basic",
        "instagram_business_content_publish",
        "instagram_business_manage_comments",
        "instagram_business_manage_insights",
        "instagram_business_manage_messages",
      ],

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


    const refresh_token = await oauth.refreshLongLivedToken(longLived.access_token)

    if (!longLived?.access_token) {
      throw new BadRequestException(
        'Instagram long-lived access token was not returned',
      );
    }

    if (!refresh_token.access_token) {
      throw new Error("refreshToken not found")
    }


    const profile =
      await this.instagramClient.getProfile(
        longLived.access_token,
      );

    return {
      userId: state,
      instagramUserId: profile.user_id,
      refreshToken: refresh_token.access_token,
      username: profile.username,
      accountType: profile.account_type,
      accessToken: longLived.access_token,
      expiresIn: longLived.expires_in,
    };
  }




  // DONE MIGRATE TO HXG PTRN
  async saveTokens({ userId, access_token, provider, platfromAccountId, expiresAt, refreshToken }: saveInstagramAccessToken) {



    return await this.instagramRepositorys.saveTokensInstagram(
      {
        userId,
        access_token,
        provider,
        refreshToken,
        expiresAt,
        platfromAccountId
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

  async getUserId(clerkId: string) {
    return this.instagramRepositorys.getUserId(clerkId)
  }


  async getAccessToken(userId: string, provider: provider) {
    return await this.instagramRepostiroy.findAccessTokenInstagram(userId, provider)
  }



  async createContainer(
    props: createIgContainerId) {

    const responseContainer = await this.instagramClients.createContainerId(props)

    if (!responseContainer.id) {
      throw new BadRequestException("container id fail create")
    } 

    console.log(responseContainer.id)


    const result:saveContainerId = {
      platfrom: "Instagram",
      userId: props.userId,
      containerId: responseContainer.id,
      platfromUserId: props.platfromUserId,
      publish: false,
      scheduledAt: props.scheduledAt!
    }



    await this.instagramRepostiroy.saveContainerId(result)


    return {
      success: true,
      data: {
        instagramContainerId: responseContainer.id,
      }
    }

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

  async findUserInstagramContainer(userId: string) {

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
  async updateCrossPlatfrom(id: string) {


    return this.instagramRepositorys.updateCrossPlatfrom(
      id,
      "Instagram"
    )
  }
}

