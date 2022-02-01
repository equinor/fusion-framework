import { AuthClient, createAuthClient, AuthRequest, ConsoleLogger } from './client';

import { IAuthConfigurator, AuthClientOptions } from './configurator';

// TODO - export from msal
export declare type AccountInfo = {
    homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
    localAccountId: string;
    name?: string;
};

export interface IAuthProvider {
    readonly defaultClient: AuthClient;
    readonly defaultConfig: AuthClientOptions | undefined;
    readonly defaultAccount: AccountInfo | undefined;
    /**
     * Get auth client by registered config name
     */
    getClient(name: string): AuthClient;
    /**
     * Create auth client by registered config name
     */
    createClient(name?: string): AuthClient;
    /**
     * Acquire token from default auth client
     */
    acquireToken(req: AuthRequest): ReturnType<AuthClient['acquireToken']>;
    /**
     * Acquire access token from default auth client
     */
    acquireAccessToken(req: AuthRequest): Promise<string | undefined>;
    /**
     * Login to default auth client
     */
    login(): Promise<void>;
    /**
     * Handle default client redirect callback
     */
    handleRedirect(): ReturnType<AuthClient['handleRedirectPromise']>;
}

const DEFAULT_CLIENT_NAME = 'default';

export class AuthProvider {
    protected _clients: Record<string, AuthClient> = {};
    get defaultClient(): AuthClient {
        return this.getClient(DEFAULT_CLIENT_NAME);
    }

    get defaultAccount(): AccountInfo | undefined {
        return this.defaultClient.account;
    }

    get defaultConfig(): AuthClientOptions | undefined {
        return this._config.defaultConfig;
    }

    constructor(protected _config: IAuthConfigurator) {}

    getClient(name: string): AuthClient {
        if (!this._clients[name]) {
            this._clients[name] = this.createClient(name);
        }
        return this._clients[name];
    }

    createClient(name?: string): AuthClient {
        const config = name ? this._config.getClientConfig(name) : this._config.defaultConfig;
        if (!config) {
            throw Error('Could not find any config');
        }
        const client = createAuthClient(
            config.tenantId,
            config.clientId,
            config.redirectUri,
            config.config
        );
        // TODO - fix with log streamer
        client.setLogger(new ConsoleLogger(3));

        return client;
    }

    async handleRedirect(): ReturnType<AuthClient['handleRedirectPromise']> {
        const { redirectUri } = this.defaultConfig || {};
        if (window.location.pathname === redirectUri) {
            const url = this.defaultClient.requestOrigin || '';
            await this.defaultClient.handleRedirectPromise();
            window.location.replace(url);
        }
        return null;
    }

    acquireToken(req: AuthRequest): ReturnType<AuthClient['acquireToken']> {
        return this.defaultClient.acquireToken(req);
    }

    async acquireAccessToken(req: AuthRequest): Promise<string | undefined> {
        const token = await this.acquireToken(req);
        return token ? token.accessToken : undefined;
    }

    async login(): Promise<void> {
        await this.defaultClient.login();
    }
}
