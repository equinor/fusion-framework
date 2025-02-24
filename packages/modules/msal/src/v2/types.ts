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
