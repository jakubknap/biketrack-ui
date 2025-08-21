export interface ResendTokenRequest {
  tokenType: string;
  email?: string;
  expiredToken?: string;
}