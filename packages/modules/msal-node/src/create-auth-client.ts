import { PublicClientApplication } from '@azure/msal-node';

import { createPersistenceCachePlugin } from './create-auth-cache.js';

/**
 * Creates and configures a new MSAL PublicClientApplication instance for Azure AD authentication.
 *
 * This function sets up the client with the specified tenant and client IDs, and attaches a secure
 * persistence cache plugin for storing authentication tokens on disk. The resulting client can be used
 * for both silent and interactive authentication flows, depending on how it is integrated.
 *
 * @param tenantId - The Azure Active Directory tenant ID (directory identifier).
 * @param clientId - The client/application ID registered in Azure AD.
 * @returns A Promise that resolves to a configured instance of `PublicClientApplication`.
 *
 * @remarks
 * The returned client uses a secure, user-scoped cache for token storage. This is recommended for CLI tools,
 * background services, and other Node.js applications that require persistent authentication.
 *
 * @example
 * ```typescript
 * const client = await createAuthClient('your-tenant-id', 'your-client-id');
 * // Use the client with MSAL APIs for authentication flows
 * ```
 */
export const createAuthClient = async (
  tenantId: string,
  clientId: string,
): Promise<PublicClientApplication> => {
  const cachePlugin = await createPersistenceCachePlugin(tenantId, clientId);
  return new PublicClientApplication({
    auth: {
      clientId: clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
    cache: { cachePlugin },
  });
};

export default createAuthClient;
