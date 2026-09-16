import { Injectable } from '@nestjs/common';
import { ClerkClient, createClerkClient } from '@clerk/backend';
import { Apikey } from '../common/configEnv/configEnv.service';
@Injectable()
export class ClerkService {
  private clerk: ClerkClient;

  constructor(private readonly apiKey: Apikey) {
    this.clerk = createClerkClient({
      secretKey: this.apiKey.getApikey("CLERK_SECRET_KEY"),
      publishableKey: this.apiKey.getApikey("CLERK_PUBLISHABLE_KEY")
    })
  }




  // async getGithubAccessToken(userId: string) {
  //   const response =
  //     await this.clerk.users.getUserOauthAccessToken(
  //       userId,
  //       'google',
  //     );

  //   return response.data[0]?.token ?? null;
  // }

  // async getGoogleAccessToken(userId: string) {
  //   console.log\(.*\) ("usrr dari clerk ",userId)
  //   const response =
  //     await this.clerk.users.getUserOauthAccessToken(
  //       userId,
  //       'google',
  //     );
  //   console.log\(.*\) ("respon dari clerk",response.data[0].token ?? null)
  //   return response.data[0]?.token ?? null;
  // }


}
