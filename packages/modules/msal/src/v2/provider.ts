import { AuthClient, createAuthClient, AuthRequest, ConsoleLogger } from './client';

import { MsalModuleVersion } from '../static';

import { AuthClientConfig } from './configurator';
import { AccountInfo, AuthenticationResult } from './types';

export interface IAuthProvider {
    readonly version: string;
    // readonly defaultClient: AuthClient;
    // readonly defaultConfig: AuthClientOptions | undefined;
    readonly defaultAccount: AccountInfo | undefined;

    /**
     * Acquire token from default auth client
     * @param req Auth request options
     */
    acquireToken(req: AuthRequest): Promise<AuthenticationResult | void>;

    /**
     * Acquire access token from default auth client
     * @param req Auth request options
     */
    acquireAccessToken(req: AuthRequest): Promise<string | undefined>;

    /**
     * Login to default auth client
     */
    login(): Promise<void>;

    /**
     * Logout
     */
    logout(options?: { redirectUri?: string }): Promise<void>;

    /**
     * Handle default client redirect callback
     */
    handleRedirect(): Promise<void | null>;
}

export class AuthProvider implements IAuthProvider {
    #client: AuthClient;

    get version(): string {
        return MsalModuleVersion.Latest;
    }

    /** @deprecated */
    get defaultClient(): AuthClient {
        return this.getClient();
    }

    get defaultAccount(): AccountInfo | undefined {
        return this.defaultClient.account;
    }

    /** @deprecated */
    get defaultConfig(): AuthClientConfig | undefined {
        return this._config;
    }

    constructor(protected _config: AuthClientConfig) {
        this.#client = this.createClient();
    }

    /** @deprecated */
    getClient(): AuthClient {
        return this.#client;
    }

    /** @deprecated */
    createClient(): AuthClient {
        const client = createAuthClient(
            this._config.tenantId,
            this._config.clientId,
            this._config.redirectUri,
        );
        // TODO - fix with log streamer
        client.setLogger(new ConsoleLogger(0));

        return client;
    }

    async handleRedirect() {
        const { redirectUri } = this.defaultConfig || {};
        if (window.location.pathname === redirectUri) {
            const client = this.defaultClient;
            const logger = client.getLogger();
            const { requestOrigin } = client;

            await client.handleRedirectPromise();
            if (requestOrigin === redirectUri) {
                logger.warning(
                    `detected callback loop from url ${redirectUri}, redirecting to root`,
                );
                window.location.replace('/');
            } else {
                window.location.replace(requestOrigin || '/');
            }
        }
        return null;
    }

    acquireToken(req: AuthRequest): ReturnType<IAuthProvider['acquireToken']> {
        return this.defaultClient.acquireToken(req);
    }

    async acquireAccessToken(req: AuthRequest) {
        const token = await this.acquireToken(req);
        return token ? token.accessToken : undefined;
    }

    async login(options?: { onlyIfRequired?: boolean }) {
        // skip login if already logged in and has valid claims
        if (options?.onlyIfRequired && this.defaultClient.hasValidClaims) {
            return;
        }
        await this.defaultClient.login();
    }

    async logout(options?: { redirectUri?: string }): Promise<void> {
        // TODO - might have an option for popup or redirect
        await this.defaultClient.logoutRedirect({
            postLogoutRedirectUri: options?.redirectUri,
            account: this.defaultAccount,
        });
    }
}
