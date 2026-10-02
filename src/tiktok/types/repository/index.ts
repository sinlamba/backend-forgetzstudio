export type Provider = 'Tiktok';

export interface SaveAccessTokenTiktok {
  id: string;
  platform: Provider;
  platformId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export type getTiktokManyContainer = {
     userId: string;
    containerId: string;
    id: string;
    platformUserId: string;
    createAt: Date;
    updateAt: Date;
    platform: string;
    publish: boolean | null;
    scheduledAt: Date | null;
}

