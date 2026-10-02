export interface FacebookClientPort {
  getOAuthUrl(state: string): string;

  exchangeCodeForToken({
    code,
    state,
  }: {
    code: string;
    state: string;
  }): Promise<{
    success: boolean;
    accessToken?: string;
    tokenType?: string;
    expiresIn?: number;
  }>;

  getPages(userAccessToken: string): Promise<
    Array<{
      id: string;
      name: string;
      access_token: string;
      category?: string;
      tasks?: string[];
    }>
  >;

  getPage(
    pageId: string,
    pageAccessToken: string,
  ): Promise<{
    id: string;
    name: string;
    category?: string;
  }>;

  createPost({
    pageId,
    pageAccessToken,
    message,
  }: {
    pageId: string;
    pageAccessToken: string;
    message: string;
  }): Promise<{
    success: boolean;
    postId: string;
  }>;
}


export const FACEBOOK_CLIENT = Symbol('FACEBOOK_CLIENT');
