import type { AuthenticationResult } from '@azure/msal-browser';
import type { AuthenticationResult as AuthenticationResult_v2 } from './types';
import { mapAccountInfo } from './map-account-info';

/**
 * Maps a current (v4/v5) `AuthenticationResult` to the v2-compatible format.
 *
 * Converts the full authentication result — including the nested account object —
 * to the subset of fields that MSAL v2 consumers expect. This enables the v2 proxy
 * layer to return type-safe results without exposing v4/v5-only properties.
 *
 * @param result - The current MSAL v4/v5 `AuthenticationResult` to convert
 * @returns A v2-compatible `AuthenticationResult` with mapped account and token fields
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
  } as AuthenticationResult_v2;
}
