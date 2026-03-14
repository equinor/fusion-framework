import type { AccountInfo } from '@azure/msal-browser';
import type { AccountInfo as AccountInfo_v2 } from './types';

/**
 * Maps a current (v4/v5) `AccountInfo` object to the v2-compatible `AccountInfo` format.
 *
 * Strips properties that don't exist in v2, ensuring backward-compatible serialization
 * and type safety when passing account data through the v2 proxy layer.
 *
 * @param account - The current MSAL v4/v5 `AccountInfo` to convert
 * @returns A v2-compatible `AccountInfo` containing only fields recognised by MSAL v2 consumers
 */
export function mapAccountInfo(account: AccountInfo): AccountInfo_v2 {
  return {
    homeAccountId: account.homeAccountId,
    environment: account.environment,
    tenantId: account.tenantId,
    username: account.username,
    localAccountId: account.localAccountId,
    name: account.name,
    idTokenClaims: account.idTokenClaims,
  };
}
