import { AuthClientConfig } from './client';

export type AuthClientOptions = {
    tenantId: string;
    clientId: string;
    redirectUri?: string;
    config?: AuthClientConfig;
};

const DEFAULT_CONFIG_KEY = 'default';

export interface IAuthConfigurator {
    /**
     * get default configuration for module
     */
    readonly defaultConfig: AuthClientOptions | undefined;

    /**
     * Get named config by key
     * @param name key for config
     */
    getClientConfig(name: string): AuthClientOptions;

    /**
     * Create named config
     * @param name key for config
     * @param options config options
     */
    configureClient(name: string, options: AuthClientOptions): AuthConfigurator;

    /**
     * Create default module config
     * @param options config options
     */
    configureDefault(options: AuthClientOptions): void;

    requiresAuth: boolean;
}

export class AuthConfigurator implements IAuthConfigurator {
    /** internal map of keyed configs */
    protected _configs: Record<string, AuthClientOptions> = {};
    requiresAuth = true;

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
