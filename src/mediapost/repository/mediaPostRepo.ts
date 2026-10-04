
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
    platform,
  }: {
    userId: string;
    platform: provider;
  }) {
    const result =
      await this.Prisma.PlatformIntegrations.findUnique({
        where: {
            userId_platform: {
            userId,
            platform,
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
    platform: string,
  ) {
    return this.Prisma.PlatformIntegrations.findUnique({
      where: {
          userId_platform: {
          userId,
          platform,
        },
      },
    });
  }

  async saveContainerId({
    containerId,
    platformUserId,
    userId,
    platform,
    publish,
    scheduledAt,
  }: {
    containerId: string;
    platformUserId: string;
    userId: string;
    platform: provider;
    publish: boolean;
    scheduledAt: Date;
  }) {
    return this.Prisma.ContainerId.create({
      data: {
        containerId,
        platformUserId,
        userId,
        platform,
        publish,
        scheduledAt,
      },
    });
  }


  async updatePlatformToken({
  userId,
  platform,
  accessToken,
  refreshToken,
  expiresAt,
}: {
  userId: string;
  platform: provider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  return this.Prisma.PlatformIntegrations.update({
    where: {
        userId_platform: {
        userId,
        platform,
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

 async getUsersPlatform(clerkId: string):Promise<string[]> {
    const id = (await this.getUsers(clerkId)).id
   
  
  
  const response = await this.Prisma.user.findUnique({
    where: {
      id:id
    }
   }) 
   if(!response) {
    throw new BadRequestException("user not found")
   }
    
   return response.crossPlatfrom

 }
 
}
