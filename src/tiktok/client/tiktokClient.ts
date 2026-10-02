import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Apikey } from '../../common/configEnv/configEnv.service';
import { TiktokClientPort } from '../port/tiktokClientPort';
import { TokenResponse } from '../types/auth';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

interface PrivateConfigTiktok {
  client_key: string;
  client_secret: string;
  redirect_url: string;
  scope: string;
}
@Injectable()
export class TiktokClient implements TiktokClientPort {
  private config: PrivateConfigTiktok;
  isPublishing = false;
  constructor(private readonly apiKey: Apikey) {
    this.config = {
      client_key: String(this.apiKey.getApikey('TIKTOK_APP_ID')),
      scope: [
        'user.info.basic',
        'video.upload',
        'video.publish', // <-- tambahkan ini
        'user.info.profile',
        'user.info.stats',
        'video.list',
      ].join(','),
      client_secret: String(this.apiKey.getApikey('TIKTOK_SECRET_KEY')),
      redirect_url: String(this.apiKey.getApikey('TIKTOK_REDIRECT_URL')),
    };
  }

  getOAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: this.config.client_key,
      scope: this.config.scope,
      response_type: 'code',
      redirect_uri: this.config.redirect_url,
      state,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const url = 'https://open.tiktokapis.com/v2/oauth/token/';

    const body = new URLSearchParams({
      client_key: this.config.client_key,
      client_secret: this.config.client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirect_url,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = (await response.json()) as TokenResponse;

    if (!response.ok) {
      throw new BadRequestException(data);
    }

    return data;
  }

  async createVideoContainer(props: {
    accessToken: string;
    videoUrl: string;
    title?: string;
  }): Promise<{
    publish_id: string;
  }> {
    console.log(props, 'ini data dari tiktokclient');
    const response = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${props.accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title: props.title ?? '',
            privacy_level: 'SELF_ONLY',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url:
              'https://sf16-va.tiktokcdn.com/obj/eden-va2/uvpapzpbxjH-aulauvJ-WV%5B%5B/ljhwZthlaukjlkulzlp/3min.mp4',
          },
        }),
      },
    );

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new BadRequestException({
        status: response.status,
        error: data,
      });
    }

    if (data.error?.code !== 'ok') {
      throw new BadRequestException({
        code: data.error?.code,
        message: data.error?.message,
        logId: data.log_id,
      });
    }

    if (!data.data?.publish_id) {
      throw new BadRequestException('TikTok tidak mengembalikan publish_id');
    }

    return {
      publish_id: data.data.publish_id,
    };
  }

  async getPostStatus(
    accessToken: string,
    publishId: string,
  ): Promise<{
    status: string;
    fail_reason?: string;
    publicly_available_post_id?: string[];
  }> {
    const response = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          publish_id: publishId,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException(data);
    }

    return {
      status: data.data.status,
      fail_reason: data.data.fail_reason,
      publicly_available_post_id: data.data.publicaly_available_post_id,
    };
  }

  async refreshAccessToken(accessToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?${new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: accessToken,
      })}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException(data);
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }
}
