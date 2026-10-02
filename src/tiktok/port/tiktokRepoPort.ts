import { provider } from '../../common/types';
import { getTiktokManyContainer, SaveAccessTokenTiktok } from '../types/repository';

export const TIKTOK_REPO = 'TIKTOK_REPO';

export interface TiktokRepoPort {
  saveAccessToken(
    props: SaveAccessTokenTiktok,
  ): Promise<Record<string, string | boolean>>;
findManyAccessTokenTiktok(userId: string[])
 updatePlatformToken({
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
  })
  getUserId(state: string): Promise<string>;
 updateCrossPlatfrom(id: string)
 getTiktokContainerUnpublisheds(): Promise<getTiktokManyContainer[]>
 chechkConnection({userId, provider}: {userId: string, provider: string})
}

