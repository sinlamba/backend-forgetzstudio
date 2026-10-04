import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
  CLIENT_PORT,
  type InstagramClientPort,
} from '../instagram/port/instagramClientPort';

import {
  InstagramRepoPort,
  REPO_PORT,
} from '../instagram/port/instagramRepoPort';

import {
  CLIENT_PORT as THREADS_CLIENT,
  type ThreadsClientPort,
} from '../threads/port/threadsClientPort';

import {
  REPO_PORT as THREADS_REPO,
  type threadsRepoPort,
} from '../threads/port/threadsRepoPort';

import { MappersThreadsGlobal } from '../threads/mappers/threads.mapper';

import {
  TIKTOK_CLIENT,
  type TiktokClientPort,
} from '../tiktok/port/tiktokClientPort';

import { MediaPostRepo } from './repository/mediaPostRepo';
import { CreateMediaContainerProps } from './types';
import { TiktokGlobalMapper } from '../tiktok/mappers/mappersTiktokGlobal';
import { provider } from '../common/types';

@Injectable()
export class MediapostService {
  constructor(
    // Instagram
    @Inject(CLIENT_PORT)
    private readonly InstagramService: InstagramClientPort,

    @Inject(REPO_PORT)
    private readonly InstagramRepo: InstagramRepoPort,

    // Threads
    @Inject(THREADS_CLIENT)
    private readonly ThreadClient: ThreadsClientPort,

    @Inject(THREADS_REPO)
    private readonly ThreadsRepo: threadsRepoPort,

    // TikTok
    @Inject(TIKTOK_CLIENT)
    private readonly TiktokClient: TiktokClientPort,

    // Global Media Repository
    private readonly mediaRepo: MediaPostRepo,
  ) {}

  async createContainerGlobal(
    props: CreateMediaContainerProps,
    userId: string,
    scheduleAt: Date,
  ) {
    const platforms = await this.InstagramRepo.getUserCrossPlatfrom(userId);

    const results: {
      platform: string;
      success: boolean;
      data?: unknown;
      error?: string;
    }[] = [];

    for (const platform of platforms) {
      console.log(platform);
      try {
        switch (platform) {
          case 'Instagram': {
              const integration =
                  await this.mediaRepo.getPlatformIntegration(
                      userId,
                      'Instagram',
                  );

              if (
                  !integration?.platformUserId!
              ) {
                  results.push({
                      platform,
                      success: false,
                      error:
                          'Instagram integration is incomplete',
                  });

                  break;
              }

              const accessToken =
                  await this.getValidAccessToken(
                      userId,
                      'Instagram',
                  );

              const response =
                  await this.InstagramService.createContainerId({
                      ...props,
                      userId,
                      accessToken,
                     platfromUserId:
                          integration.platformUserId!,
                  });

              // Save container hanya di sini.
              await this.mediaRepo.saveContainerId({
                  containerId: response.id,
                  platformUserId:
                      integration.platformUserId!,
                  userId,
                  platform: 'Instagram',
                  publish: false,
                  scheduledAt: scheduleAt,
              });

              results.push({
                  platform,
                  success: true,
                  data: response,
              });

              break;
          }

          case 'Threads': {
              const integration =
                  await this.mediaRepo.getPlatformIntegration(
                      userId,
                      'Threads',
                  );

              if (!integration?.platformUserId!) {
                  results.push({
                      platform,
                      success: false,
                      error:
                          'Threads integration is incomplete',
                  });

                  break;
              }

              const accessToken =
                  await this.getValidAccessToken(
                      userId,
                      'Threads',
                  );

              const mapper =
                  MappersThreadsGlobal.instagramContainerToThreads(
                      {
                          ...props,
                          userId,
                          accessToken,
                         platfromUserId:
                              integration.platformUserId!,
                      },
                  );

              const response =
                  await this.ThreadClient.createMediaContainer(
                      mapper,
                  );

              await this.mediaRepo.saveContainerId({
                  containerId: response.id,
                  platformUserId:
                      integration.platformUserId!,
                  userId,
                  platform: 'Threads',
                  publish: false,
                  scheduledAt: scheduleAt,
              });

              results.push({
                  platform,
                  success: true,
                  data: response,
              });

              break;
          }

          case 'Tiktok': {
            const integration = await this.mediaRepo.getPlatformIntegration(
              userId,
              'Tiktok',
            );

            if (!integration?.platformUserId!) {
              results.push({
                platform,
                success: false,
                error: 'TikTok integration is incompletee',
              });

              break;
            }

            const accessToken = await this.getValidAccessToken(
              userId,
              'Tiktok',
            );

            const mapper = TiktokGlobalMapper.fromGlobal(props, accessToken);
            console.log('ini data yang mengalir ke tiktok', mapper);
            const response =
              await this.TiktokClient.createVideoContainer(mapper);

            await this.mediaRepo.saveContainerId({
              containerId: response.publish_id,
              platformUserId: integration.platformUserId!,
              userId,
              platform: 'Tiktok',
              publish: false,
              scheduledAt: scheduleAt,
            });

            results.push({
              platform,
              success: true,
              data: response,
            });

            break;
          }

          case 'Facebook': {
            results.push({
              platform,
              success: false,
              error: 'Facebook is not implemented yet',
            });

            break;
          }

          default: {
            results.push({
              platform,
              success: false,
              error: `Unsupported platform: ${platform}`,
            });
          }
        }
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: results.some((result) => result.success),
      data: results,
    };
  }

  private async getValidAccessToken(
    userId: string,
    platform: provider,
  ): Promise<string> {
    const integration = await this.mediaRepo.getPlatformIntegration(
      userId,
      platform,
    );

    if (!integration) {
      throw new BadRequestException(`${platform} belum terhubung`);
    }

    if (!integration.accessToken) {
      throw new BadRequestException(`${platform} tidak memiliki access token`);
    }

    // Token masih valid
    if (
      integration.expiresAt &&
      integration.expiresAt.getTime() > Date.now() + 60_000
    ) {
      return integration.accessToken;
    }

    let tokenResponse;

    switch (platform) {
      case 'Instagram':
        tokenResponse = await this.InstagramService.refreshAccessToken(
          integration.accessToken,
        );
        break;

      case 'Threads':
        tokenResponse = await this.ThreadClient.refreshAccessToken(
          integration.accessToken,
        );
        break;

      case 'Tiktok':
        if (!integration.refreshToken) {
          throw new BadRequestException('TikTok refresh token tidak tersedia');
        }

        tokenResponse = await this.TiktokClient.refreshAccessToken(
          integration.refreshToken,
        );
        break;

      default:
        throw new BadRequestException(
          `Refresh token untuk ${platform} belum tersedia`,
        );
    }

    // expiresIn biasanya berupa detik
    const expiresAt = new Date(Date.now() + tokenResponse.expiresIn * 1000);

    // Simpan token baru
    await this.mediaRepo.updatePlatformToken({
      userId,
      provider: platform,
      accessToken: tokenResponse.accessToken,
      ...(tokenResponse.refreshToken && {
        refreshToken: tokenResponse.refreshToken,
      }),
      expiresAt,
    });

    return tokenResponse.accessToken;
  }


   async getCrossPlatformUsers(clerkId: string) {
    return this.mediaRepo.getUsersPlatform(clerkId)
   }
   
}
