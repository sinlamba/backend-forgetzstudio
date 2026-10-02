
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import { provider } from '../../common/types';

@Injectable()
export class MediaPostRepo {
  constructor(
    private readonly Prisma: DatabaseService,
  ) {}

  async getUsers(clerkId: string) {
    const result = await this.Prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!result) {
      throw new BadRequestException(
        'User tidak ditemukan',
      );
    }

    return result;
  }

  async getAcessTokenFromDb({
    userId,
    provider,
  }: {
    userId: string;
    provider: provider;
  }) {
    const result =
      await this.Prisma.PlatfromIntegration.findUnique({
        where: {
            userId_platform: {
            userId,
            provider,
          },
        },
      });

    if (!result) {
      throw new BadRequestException(
        'ACCESS TOKEN MU BELUM ADA BOY',
      );
    }

    return result;
  }

  async getPlatformIntegration(
    userId: string,
    provider: string,
  ) {
    return this.Prisma.PlatfromIntegration.findUnique({
      where: {
          userId_platform: {
          userId,
          provider,
        },
      },
    });
  }

  async saveContainerId({
    containerId,
    platfromUserId,
    userId,
    platfrom,
    publish,
    scheduledAt,
  }: {
    containerId: string;
    platfromUserId: string;
    userId: string;
    platfrom: provider;
    publish: boolean;
    scheduledAt: Date;
  }) {
    return this.Prisma.ContainerId.create({
      data: {
        containerId,
        platfromUserId,
        userId,
        platfrom,
        publish,
        scheduledAt,
      },
    });
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
  return this.Prisma.PlatfromIntegration.update({
    where: {
        userId_platform: {
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
