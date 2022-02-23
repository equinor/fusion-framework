import {
    PublicClientApplication,
    Configuration,
    AuthenticationResult,
    SsoSilentRequest,
    PopupRequest,
    RedirectRequest,
    AccountInfo,
} from '@azure/msal-browser';

import { AuthBehavior, defaultBehavior } from './behavior';
import { AuthRequest } from './request';

/**
 * ### Simple extension of Microsoft`s authentication client.
 *
 * When using this client tenant is **required** since common login is deprecated after all.
 * By providing tenant the user account can simple be extracted from current session *if any*.
 *
 * @example
 * ```typescript
 * const tenantId = '224123a0d-7990-4ba1-aff3-1dss9569af32';
 * const authPath = '/my-app/auth';
 * const client = new AuthClient(tenantId, {
 *    auth: {
 *        clientId: '6dab35d4-59ff-4dcc-3356-24479e6fc888',
 *        authority: `https://login.microsoftonline.com/${tenantId}`,
 *        redirectUri:  window.location.origin + '/my-app/auth'
 *    }
 * });
 * document.getElementById('login-btn').addEventListener('click', () =>
 *    client.login({ scopes: ['data.read'] })
 *      .then(console.log)
 *      .catch(console.error)
 * );
 * (async() => {
 *    if(window.location.path === authPath) {
 *        await client.handleRedirectPromise()
 *    }
 * )();
 * ```
 * @see [Microsoft Authentication Library](https://github.com/AzureAD/microsoft-authentication-library-for-js)
 * @see [Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
 */
export class AuthClient extends PublicClientApplication {
    /**
     * @returns
     * Returns account for client tenant that MSAL currently has data for.
     * (the account object is created at the time of successful login)
     */
    get account(): AccountInfo | undefined {
        const accounts = this.getAllAccounts();
        return accounts.find((a) => (a.idTokenClaims as { aud: string })?.aud === this.clientId);
    }

    /**
     * @returns - Configured client id
     */
    get clientId(): string | undefined {
        return this.config.auth?.clientId;
    }

    get requestOrigin(): string | null {
        return this.browserStorage.getTemporaryCache('request.origin', true);
    }

    /**
     * @param tenantId - tenant id for client domain
     * @param config - required [Configuration](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/src/config/Configuration.ts)
     */
    constructor(readonly tenantId: string, config: Configuration) {
        super(config);
    }

    /**
     * @param silent
     * Attempt to use a hidden iframe to fetch an authorization code from the eSTS if {@link AuthClient.account} or login hint.
     * Provided {@link AuthBehavior} is used as fallback.
     * There are cases where this may not work:
     * - Any browser using a form of Intelligent Tracking Prevention
     * - If there is not an established session with the service
     *
     * @returns
     * Promise that is fulfilled when this function has completed, or rejected if an error was raised.
     */
    async login(
        options?: AuthRequest,
        behavior: AuthBehavior = defaultBehavior,
        silent = true
    ): Promise<AuthenticationResult | void> {
        const loginHint = options?.loginHint || this.account?.username;
        const scopes = options?.scopes || [];
        const request = { ...options, loginHint, scopes };

        if (loginHint && silent) {
            this.logger.verbose('Attempting to login in silently');
            try {
                return this.ssoSilent(request as SsoSilentRequest);
            } catch {
                this.logger.verbose('Silent login attempt failed');
            }
        }

        this.logger.verbose(`Attempting to login in by [${behavior}]`);

        switch (behavior) {
            case 'popup':
                return this.loginPopup(request as PopupRequest);
            case 'redirect': {
                return this.loginRedirect(request as RedirectRequest);
            }
        }
    }

    /**
     * Will try to silently acquire an access token for a given set of scopes.
     * Will use cached token if available, otherwise will attempt to acquire a new token from the network via refresh token.
     *
     * @param silent
     * Attempt to use a hidden iframe to fetch an authorization code from the eSTS if {@link AuthClient.account} or login hint.
     * Provided {@link AuthBehavior} is used as fallback.
     * There are cases where this may not work:
     * - Any browser using a form of Intelligent Tracking Prevention
     * - If there is not an established session with the service
     *
     * @returns
     * Promise that is fulfilled when this function has completed, or rejected if an error was raised.
     */
    public async acquireToken(
        options: AuthRequest = { scopes: [] },
        behavior: AuthBehavior = defaultBehavior,
        silent = true
    ): Promise<AuthenticationResult | void> {
        const account = await this.account;
        if (silent && account) {
            this.logger.verbose('Attempting to acquire token in silently');
            try {
                return this.acquireTokenSilent({ account, ...options });
            } catch (err) {
                this.logger.info(
                    'Expected to navigate away from the current page but timeout occurred.'
                );
            }
        }

        this.logger.verbose(`Attempting to acquire token by [${behavior}]`);

        switch (behavior) {
            case 'popup':
                return this.acquireTokenPopup(options);
            case 'redirect': {
                return this.acquireTokenRedirect(options);
            }
        }
    }
}

export default AuthClient;
