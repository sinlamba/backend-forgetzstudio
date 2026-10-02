import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { FACEBOOK_CLIENT, type FacebookClientPort } from './port/facebookClientPort';


@Injectable()
export class FacebookService {
  constructor(
    @Inject(FACEBOOK_CLIENT)
    private readonly facebookClient: FacebookClientPort,
  ) {}

  /**
   * Generate Facebook OAuth URL
   */
  getOAuthUrl(state: string): string {
    return this.facebookClient.getOAuthUrl(state);
  }

  /**
   * Exchange authorization code
   * menjadi User Access Token
   */
  async exchangeCodeForToken({
    code,
    state,
  }: {
    code: string;
    state: string;
  }) {
    return this.facebookClient.exchangeCodeForToken({
      code,
      state,
    });
  }

  /**
   * Get Facebook Pages yang dapat dikelola user
   */
  async getPages(userAccessToken: string) {
    if (!userAccessToken) {
      throw new BadRequestException(
        'Facebook user access token is required',
      );
    }

    return this.facebookClient.getPages(userAccessToken);
  }

  /**
   * Get detail Facebook Page
   */
  async getPage({
    pageId,
    pageAccessToken,
  }: {
    pageId: string;
    pageAccessToken: string;
  }) {
    if (!pageId || !pageAccessToken) {
      throw new BadRequestException(
        'Page ID and Page Access Token are required',
      );
    }

    return this.facebookClient.getPage(
      pageId,
      pageAccessToken,
    );
  }

  /**
   * Publish text post to Facebook Page
   */
  async createPost({
    pageId,
    pageAccessToken,
    message,
  }: {
    pageId: string;
    pageAccessToken: string;
    message: string;
  }) {
    if (!pageId) {
      throw new BadRequestException(
        'Facebook Page ID is required',
      );
    }

    if (!pageAccessToken) {
      throw new BadRequestException(
        'Facebook Page Access Token is required',
      );
    }

    if (!message?.trim()) {
      throw new BadRequestException(
        'Post message is required',
      );
    }

    return this.facebookClient.createPost({
      pageId,
      pageAccessToken,
      message,
    });
  }
}