
export interface TokenResponse {
  /**
   * A token that can be sent to a Threads API.
   */
  access_token: string;
  /**
   * Identifies the type of token returned. At this time, this field always has the value Bearer.
   */
  token_type: string;
  /**
   * The time in seconds at which this token is thought to expire.
   */
  expires_in: number;

  user_id: string
}


export type RefreshTokenResult = {
    accessToken: string;
    expiresAt?: Date;
    refreshToken?: string;
};

