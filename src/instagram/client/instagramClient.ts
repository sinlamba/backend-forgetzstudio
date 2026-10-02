import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron } from "@nestjs/schedule"
import { createIgContainerId, containerResultType, instagramContainerResultType, publishExecType } from '../types';
import { InstagramRepository } from '../repository/instagramRepo';
import {
  InstagramClient as MetaInstagramClient,
} from '@binary-black-holes/instagram-api';
import axios from 'axios';
import { Apikey } from '../../common/configEnv/configEnv.service';
import { InstagramClientPort } from '../port/instagramClientPort';
import { InstagramMediaResponse } from '../types/mediaType';
import { ThreadsService } from '../../threads/threads.service';
import { MappersThreadsGlobal } from '../../threads/mappers/threads.mapper';





@Injectable()
export class InstagramClient implements InstagramClientPort {
  public base_url: string;
  private isPublishing = false


  constructor(private readonly instagramRepository: InstagramRepository,
    private readonly apikey: Apikey,


  ) {

    this.base_url = this.apikey.getApikey("INSTAGRAM_BASE_URL")
  }

  async getProfile(accessToken: string) {
    const client = new MetaInstagramClient({
      loginType: 'instagram',
      accessToken,
      apiVersion: 'v25.0',
    });





    return client.users.getProfile({
      fields: [
        'user_id',
        'username',
        'account_type',
        'profile_picture_url',
        'follows_count',
        'followers_count',
        'media_count'


      ],
    });



  }

  async getMedia(accessToken: string) {
    const client = new MetaInstagramClient({
      loginType: "instagram",
      accessToken,
      apiVersion: "v25.0",
    });

    const response = await client.users.listMedia({
      fields: [
        "id",
        "caption",
        "media_type",
        "media_url",
        "thumbnail_url",
        "permalink",
        "timestamp",
        "like_count",
        "comments_count",
        "owner",
      ],
    });

    return response.data;
  }


  private getContainerUrl(instagramUserId: string) {
    return `${this.base_url}/${instagramUserId}/media`;
  }

  async checkToken(accessToken: string) {
    const url = this.apikey.getApikey("INSTAGRAM_BASE_URL")
    const response = await fetch(
      `${url}/me?access_token=${encodeURIComponent(accessToken)}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message || 'Instagram access token invalid',
      );
    }

    return data;
  }

  async createContainerId({
    platfromUserId,
    videoUrl,
    caption,
    accessToken,
    audioName,
  }: createIgContainerId): Promise<containerResultType> {
    if (!platfromUserId) {
      throw new Error('Instagram user ID not found');
    }

    if (!accessToken) {
      throw new Error('Instagram access token not found');
    }

    const url = this.getContainerUrl(platfromUserId);



    const body = new URLSearchParams({
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      access_token: accessToken,
    });

    if (audioName) {
      body.set('audio_name', audioName);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });


    const data = await response.json();

    if (!response.ok) {
      console.error('Instagram API error:', {
        status: response.status,
        data,
      });

      throw new Error(
        JSON.stringify({
          status: response.status,
          message: data?.error?.message,
          type: data?.error?.type,
          code: data?.error?.code,
          subcode: data?.error?.error_subcode,
          fbtrace_id: data?.error?.fbtrace_id,
        }),
      );
    }
    return data;
  }

async refreshAccessToken(
  accessToken: string,
): Promise<{
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
  async publishExec({
    instagramUserId,
    containerId,
    accessToken,
  }: publishExecType) {

    const url = this.apikey.getApikey("INSTAGRAM_BASE_URL");

    const response = await axios.post(
      `${url}/${instagramUserId}/media_publish`,
      {
        creation_id: containerId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  @Cron("* * * * *")
  async instagramPublish() {
      if (this.isPublishing) {
    console.log("Publish masih berjalan, skip cron.");
    return;
  }

  this.isPublishing = true;
    try {


      // 1. Ambil semua container yang belum dipublish
      const containers =
        await this.instagramRepository.getInstagramContainerUnpublisheds();

      if (!containers.length) {
        return;
      }

      console.log(
        `Found ${containers.length} unpublished Instagram containers`,
      );

      // 2. Ambil semua userId
      const userIds = [
        ...new Set(
          containers.map((item) => item.userId),
        ),
      ]; 

      // 3. Ambil semua token sekaligus
      const findTokens =
        await this.instagramRepository.findManyAccessTokenInstagram(
          userIds,
        );

      console.log(
        `Found ${findTokens.length} Instagram access tokens`,
      );

      // 4. Buat Map agar pencarian token O(1)
      const tokenMap = new Map(
        findTokens.map((token) => [
          token.userId,
          token.accessToken,
        ]),
      );

      // 5. Proses setiap container
      for (const post of containers) {
        const accessToken = tokenMap.get(post.userId);

        if (!accessToken) {
          console.error(
            `Access token tidak ditemukan untuk user ${post.userId}`,
          );

          continue;
        }

        try {
          console.log(
            `Publishing container ${post.containerId}...`,
          );

          const postData = await this.publishExec({
            instagramUserId: post.platfromUserId,
            containerId: post.containerId,
            accessToken,
          });

          // 6. Jangan update DB kalau publish gagal
          if (!postData) {
            console.error(
              `Gagal publish container ${post.containerId}`,
            );

            continue;
          }

          // 7. Instagram berhasil publish,
          // baru update database
          const update =
            await this.instagramRepository.updatePublish(
              post.id,
            );

          console.log(
            `Container ${post.containerId} berhasil dipublish`,
          );

          console.log(
            "Database updated:",
            update.id,
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              `Instagram API error untuk container ${post.containerId}`,
            );

            console.error(
              "Status:",
              error.response?.status,
            );

            console.error(
              "Response:",
              error.response?.data,
            );
          } else {
            console.error(
              `Error publish container ${post.containerId}:`,
              error,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Instagram publish cron error:",
        error,
      );
    }finally {

        this.isPublishing = false;

    }
  }








  async getInstagramContainer(userId: string) {
    const response =
      await this.instagramRepository.findManyContainerId(userId);

    const result: string[] = response.map((item) => item.containerId);

    return result;
  }


  async findInstagramContainer(userId: string): Promise<instagramContainerResultType[]> {

    return this.instagramRepository.findInstagramContainer(userId)


  }






}