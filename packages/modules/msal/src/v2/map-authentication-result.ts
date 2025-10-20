import type { AuthenticationResult } from '@azure/msal-browser';
import type { AuthenticationResult as AuthenticationResult_v2 } from './types';
import { mapAccountInfo } from './map-account-info';

/**
 * Maps current AuthenticationResult to v2 AuthenticationResult format.
 *
 * @param result - The current AuthenticationResult to convert
 * @returns The v2 AuthenticationResult format
 */
export function mapAuthenticationResult(result: AuthenticationResult): AuthenticationResult_v2 {
  return {
    authority: result.authority,
    uniqueId: result.uniqueId,
    tenantId: result.tenantId,
    scopes: result.scopes,
    account: result.account ? mapAccountInfo(result.account) : null,
    idToken: result.idToken,
    idTokenClaims: result.idTokenClaims,
    accessToken: result.accessToken,
    expiresOn: result.expiresOn,
    tokenType: result.tokenType,
  };
}
