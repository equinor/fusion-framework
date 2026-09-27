import type { AccountInfo } from '@azure/msal-browser';

/** Input supplied to an injected mock token acquisition function. */
export interface MsalMockTokenRequest {
  /** OAuth scopes requested by the Fusion provider. */
  scopes: string[];
  /** Account active immediately before token acquisition. */
  account: AccountInfo | null;
  /** Client ID configured for the mock MSAL client. */
  clientId: string;
}

/**
 * Acquires a mock access token from the active test runtime.
 *
 * @returns A token whose claims define the active account, or `null` to restore
 * the built-in in-process fallback.
 */
export type MsalMockTokenAcquirer = (
  request: MsalMockTokenRequest,
) => string | null | Promise<string | null>;

/** Internal identity fields derived from an acquired mock token. */
export interface MsalMockUser {
  /** Display name of the signed-in user. */
  name?: string;
  /** UPN or email of the signed-in user. */
  username?: string;
  /** Object ID of the signed-in user. */
  userId?: string;
  /** Tenant the user belongs to. */
  tenantId?: string;
  /** Scopes granted by the token. */
  scopes?: string[];
}
