/**
 * MSAL v2 compatible AccountInfo type.
 *
 * This type represents account information in MSAL v2 format
 * to maintain backward compatibility while using MSAL v4 implementation.
 */
export type AccountInfo = {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
  idTokenClaims?: {
    [key: string]: string | number | string[] | object | undefined | unknown;
  };
};

/**
 * MSAL v2 compatible AuthenticationResult type.
 *
 * This type represents authentication results in MSAL v2 format
 * to maintain backward compatibility while using MSAL v4 implementation.
 */
export type AuthenticationResult = {
  authority: string;
  uniqueId: string;
  tenantId: string;
  scopes: Array<string>;
  account: AccountInfo | null;
  idToken: string;
  idTokenClaims: object;
  accessToken: string;
  expiresOn: Date | null;
  tokenType: string;
};
