import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { TiktokRepoPort } from '../port/tiktokRepoPort';
import { getTiktokManyContainer, SaveAccessTokenTiktok } from '../types/repository';
import { provider } from '../../common/types';

@Injectable()
export class TiktokRepository implements TiktokRepoPort {
  constructor(private readonly prisma: DatabaseService) { }

  async saveAccessToken(
    props: SaveAccessTokenTiktok,
  ): Promise<Record<string, string | boolean>> {
    const response = await this.prisma.PlatfromIntegration.create({
      data: {
        userId: props.id,
        provider: props.provider,
        accessToken: props.accessToken,
        refreshToken: props.refreshToken,
        platfromAccountId: props.platformId,
        expiresAt: props.expiresAt,
      },
    });

    if (!response) {
      throw new BadRequestException('save data access_token is fail');
    }

    return {
      success: Boolean(response.userId),
      message: 'success get access_token',
    };
  }

  async getUserId(state: string): Promise<string> {
    const result = await this.prisma.user.findUnique({
      where: {
        clerkId: state,
      },
    });

    if (!result) {
      throw new BadRequestException('user not found');
    }

    return result.id;
  }

  async getScheduledTikTokPosts() {
    return this.prisma.ContainerId.findMany({
      where: {
        platfrom: 'Tiktok',
        publish: false,
        scheduledAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async chechkConnection({ userId, provider }: { userId: string, provider: string }) {
    return this.prisma.PlatfromIntegration.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    })
  }


  async updatePublishStatus(
    id: string,
    publish: boolean,
  ) {
    return this.prisma.ContainerId.update({
      where: {
        id,
      },
      data: {
        publish,
      },
    });
  }

  async updateCrossPlatfrom(id: string) {
    const data = await this.findUserHelper(id)

    return this.prisma.user.update({
      where: {
        id: id
      },
      data: {
        ...data,
        crossPlatfrom: [
          ...(data?.crossPlatfrom ?? []),
          "Tiktok"
        ]
      }
    })
  }


  private findUserHelper(id: string) {
    return this.prisma.user.findUnique(
      {
        where: {
          id: id
        }
      }
    )
  }

  async getTiktokContainerUnpublisheds(): Promise<getTiktokManyContainer[]> {
    const now = new Date();

    const data = await this.prisma.ContainerId.findMany({
      where: {
        platfrom: "Tiktok",
        publish: false,
        scheduledAt: {
          lte: now,
        },
      },
    });

    return data
  }


  async findManyAccessTokenTiktok(userId: string[]) {
    const data = await this.prisma.PlatfromIntegration.findMany({
      where: {
        provider: "Tiktok",
        userId: {
          in: userId
        }

      }
    })

    return data

  }

  async updatePlatformToken({
    userId,
    provider,
    accessToken,
    refreshToken,
    expiresAt,
  }: {
    userId: string;
    provider: provider;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }) {
    return this.prisma.PlatfromIntegration.update({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      data: {
        accessToken,
        ...(refreshToken !== undefined && {
          refreshToken,
        }),
        ...(expiresAt !== undefined && {
          expiresAt,
        }),
      },
    });
  }
}
