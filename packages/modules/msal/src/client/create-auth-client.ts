import { Configuration, IPublicClientApplication } from '@azure/msal-browser';
import { AuthClient } from './client';
import { normalizeUri } from './util/url';
import { AuthBehavior } from './behavior';

export type AuthClientConfig = Omit<Configuration, 'auth'> & {
    auth?: Partial<Configuration['auth']>;
    behavior?: AuthBehavior;
};

/**
 * Creates an authentication client with basic config.
 *
 * @example
 * ```typescript
 * const myClient = createClient(
 *  '224123a0d-7990-4ba1-aff3-1dss9569af32',
 *  '6dab35d4-59ff-4dcc-3356-24479e6fc888',
 *  '/my-app/auth'
 * );
 * ```
 *
 * @template T - client type, default to {@link AuthClient}
 *
 * @param tenantId - tenant to for authentication
 * @param clientId - client id for authentication
 * @param redirectUri - callback url for authentication (must match exact configured url in app)
 * @param config - optional [Configuration](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/src/config/Configuration.ts)
 * @param ctor - optional client class
 */
export const createAuthClient = <T extends IPublicClientApplication = AuthClient>(
    tenantId: string,
    clientId: string,
    redirectUri?: string,
    config?: AuthClientConfig,
    ctor?: new (tenantId: string, config: Configuration, defaultBehavior?: AuthBehavior) => T,
): T => {
    const auth: Configuration['auth'] = {
        clientId,
        redirectUri: normalizeUri(redirectUri || ''),
        navigateToLoginRequestUrl: false,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        ...config?.auth,
    };
    const cache = { cacheLocation: 'localStorage', ...config?.cache };
    const { behavior, system } = config ?? {};
    return new (ctor || AuthClient)(tenantId, { auth, cache, system }, behavior) as T;
};

export default createAuthClient;
