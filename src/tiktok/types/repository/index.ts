export type Provider = 'Tiktok';

export interface SaveAccessTokenTiktok {
  id: string;
  provider: Provider;
  platformId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export type getTiktokManyContainer = {
     userId: string;
    containerId: string;
    id: string;
    platfromUserId: string;
    createAt: Date;
    updateAt: Date;
    platfrom: string;
    publish: boolean | null;
    scheduledAt: Date | null;
}

