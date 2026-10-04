import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TIKTOK_CLIENT, type TiktokClientPort } from './port/tiktokClientPort';
import { TIKTOK_REPO, type TiktokRepoPort } from './port/tiktokRepoPort';
import { convertNumberToDate } from '../common//utils/convertNumberToDate';

@Injectable()
export class TiktokService {
  public isPublishing = true
  constructor(
    @Inject(TIKTOK_REPO)
    private readonly TiktokRepo: TiktokRepoPort,

    @Inject(TIKTOK_CLIENT)
    private readonly TiktokClient: TiktokClientPort,
  ) {}

  async getOAuthUrl(state: string) {
    return this.TiktokClient.getOAuthUrl(state);
  }

  async getCallbackUrl({
    code,
    userId,
  }: {
    code: string;
    userId: string;
  }) {
    const result = await this.TiktokClient.exchangeCodeForToken(code);

    await this.TiktokRepo.saveAccessToken({
      id: userId,
      platform: 'Tiktok',
      platformId: result.open_id,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresAt: convertNumberToDate(result.expires_in),
    });

    return result;
  }

  async getUserId(state: string) {
    return this.TiktokRepo.getUserId(state);
  }
    async updateCrossPlatfrom(id: string) {

        return this.TiktokRepo.updateCrossPlatfrom(id)
    }
 
     

    async checkConnection(userId: string) {
      const id =await  this.getUserId(userId)
      return this.TiktokRepo.chechkConnection({
        userId:id,
        provider:"Tiktok"
      })
    }



 
// @Cron('* * * * *')
// async tiktokPublish() {
//   if (this.isPublishing) {
//     console.log('Publish masih berjalan, skip cron.');
//     return;
//   }

//   this.isPublishing = true;

//   try {
//     // 1. Ambil semua TikTok post yang sudah waktunya diproses
//     const posts =
//       await this.TiktokRepo.getTiktokContainerUnpublisheds();

//     if (!posts.length) {
//       return;
//     }

//     console.log(
//       `Found ${posts.length} unpublished TikTok posts`,
//     );

//     // 2. Ambil semua userId
//     const userIds = [
//       ...new Set(
//         posts.map((item) => item.userId),
//       ),
//     ];

//     // 3. Ambil semua TikTok integration sekaligus
//     const integrations =
//       await this.TiktokRepo.findManyAccessTokenTiktok(
//         userIds,

//       );

//     console.log(
//       `Found ${integrations.length} TikTok integrations`,
//     );

//     // 4. Buat Map agar pencarian integration O(1)
//     const integrationMap = new Map<string, string>(
//       integrations.map((integration: AccessTokenResult) => [
//         integration.userId,
//         integration.accessToken,
//       ]),
//     );
    
//     // 5. Proses setiap post
//     for (const post of posts) {
//       try {
//         const integration =
//           integrationMap.get(post.userId);

//         if (!integration) {
//           console.error(
//             `TikTok integration tidak ditemukan untuk user ${post.userId}`,
//           );

//           continue;
//         }

//         if (!integration.length) {
//           console.error(
//             `TikTok account ID tidak ditemukan untuk user ${post.userId}`,
//           );

//           continue;
//         }

//         // 6. Ambil access token yang masih valid
//         const accessToken =
//           await this.getValidAccessToken(
//             post.userId,
//             'Tiktok',
//           );

//         console.log(
//           `Checking TikTok publish ${post.containerId}...`,
//         );

//         // 7. Cek status publish_id
//         const status =
//           await this.TiktokClient.getPostStatus(
//             accessToken,
//             post.containerId,
//           );

//         console.log(
//           `TikTok status ${post.containerId}:`,
//           status.status,
//         );

//         // 8. Kalau masih processing, jangan update DB
//         if (
//           status.status === 'PROCESSING_UPLOAD' ||
//           status.status === 'PROCESSING_DOWNLOAD'
//         ) {
//           console.log(
//             `TikTok ${post.containerId} masih processing`,
//           );

//           continue;
//         }

//         // 9. Kalau berhasil publish
//         if (
//           status.status === 'PUBLISH_COMPLETE'
//         ) {
//           const update =
//             await this.TiktokRepo.updatePublish(
//               post.id,
//             );

//           console.log(
//             `TikTok ${post.containerId} berhasil dipublish`,
//           );

//           console.log(
//             'Database updated:',
//             update.id,
//           );

//           continue;
//         }

//         // 10. Kalau gagal
//         if (status.status === 'FAILED') {
//           console.error(
//             `TikTok ${post.containerId} gagal dipublish`,
//           );

//           console.error(
//             'Reason:',
//             status.fail_reason,
//           );

//           continue;
//         }

//       } catch (error) {
//         console.error(
//           `Error publish TikTok ${post.containerId}:`,
//           error,
//         );
//       }
//     }
//   } catch (error) {
//     console.error(
//       'TikTok publish cron error:',
//       error,
//     );
//   } finally {
//     this.isPublishing = false;
//   }
// }


}
