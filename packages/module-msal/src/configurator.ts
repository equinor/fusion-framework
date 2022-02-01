import { AuthClientConfig } from './client';

export type AuthClientOptions = {
    tenantId: string;
    clientId: string;
    redirectUri?: string;
    config?: AuthClientConfig;
};

const DEFAULT_CONFIG_KEY = 'default';

export interface IAuthConfigurator {
    readonly defaultConfig: AuthClientOptions | undefined;
    getClientConfig(name: string): AuthClientOptions;
    configureClient(name: string, options: AuthClientOptions): AuthConfigurator;
    configureDefault(options: AuthClientOptions): void;
}

export class AuthConfigurator implements IAuthConfigurator {
    protected _configs: Record<string, AuthClientOptions> = {};

    get defaultConfig(): AuthClientOptions | undefined {
        return this._configs[DEFAULT_CONFIG_KEY];
    }

    getClientConfig(name: string): AuthClientOptions {
        return this._configs[name];
    }

    configureClient(name: string, options: AuthClientOptions): AuthConfigurator {
        this._configs[name] = options;
        return this;
    }

    configureDefault(options: AuthClientOptions): void {
        if (this._configs[DEFAULT_CONFIG_KEY]) {
            throw Error('Default AuthClient already provided');
        }
        this.configureClient(DEFAULT_CONFIG_KEY, options);
    }
}
