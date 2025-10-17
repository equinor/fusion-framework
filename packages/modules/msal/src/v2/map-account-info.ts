import type { AccountInfo } from '@azure/msal-browser';
import type { AccountInfo as AccountInfo_v2 } from './types';

/**
 * Maps current AccountInfo to v2 AccountInfo format.
 *
 * @param account - The current AccountInfo to convert
 * @returns The v2 AccountInfo format
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
