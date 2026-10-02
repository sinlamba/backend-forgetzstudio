import { TokenResponse } from "../types/auth"

export const TIKTOK_CLIENT = "TIKTOK_CLIENT"

export interface TiktokClientPort {
  getOAuthUrl(state: string): string;

  exchangeCodeForToken(code: string): Promise<TokenResponse>;

  createVideoContainer(props: {
    accessToken: string;
    videoUrl: string;
    title?: string;
  }): Promise<{
    publish_id: string;
  }>;

 refreshAccessToken(
    accessToken: string,
  ): Promise<{
    accessToken: string;
    expiresIn: number;
  }>;


   createVideoContainer(props: {
    accessToken: string;
    videoUrl: string;
    title?: string;
  }): Promise<{
    publish_id: string;
  }>;

  getPostStatus(
    accessToken: string,
    publishId: string,
  ): Promise<{
    status: string;
    fail_reason?: string;
    publicly_available_post_id?: string[];
  }>;
}