import { AuthClient, createAuthClient } from '@equinor/fusion-web-msal';

// TODO
import { AuthRequest } from '@equinor/fusion-web-msal/dist/request';

import { IAuthConfigurator, AuthClientOptions } from './configurator';

export interface IAuthProvider {
    readonly client: AuthClient;
    readonly defaultConfig: AuthClientOptions | undefined;
    createClient(name?: string): AuthClient;
    acquireToken(req: AuthRequest): Promise<{ accessToken: string } | void>;
    acquireAccessToken(req: AuthRequest): Promise<string | undefined>;
    login(): Promise<void>;
}

export class AuthProvider {
    get client(): AuthClient {
        return this.createClient();
    }

    get defaultConfig(): AuthClientOptions | undefined {
        return this._config.defaultConfig;
    }

    constructor(protected _config: IAuthConfigurator) {}

    createClient(name?: string): AuthClient {
        const config = name ? this._config.getClientConfig(name) : this._config.defaultConfig;
        if (!config) {
            throw Error('Could not find any config');
        }
        return createAuthClient(
            config.tenantId,
            config.clientId,
            config.redirectUri,
            config.config
        );
    }

    acquireToken(req: AuthRequest): Promise<{ accessToken: string } | void> {
        return this.createClient().acquireToken(req);
    }

    async acquireAccessToken(req: AuthRequest): Promise<string | undefined> {
        const token = await this.acquireToken(req);
        return token ? token.accessToken : undefined;
    }

    async login(): Promise<void> {
        await this.client.login();
    }
}
