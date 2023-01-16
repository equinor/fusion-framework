import { AuthApp, AuthContainer, AuthUser } from '@equinor/fusion';
import { AccountInfo } from '@equinor/fusion-framework-module-msal/client';
import { FusionAuthAppNotFoundError } from '@equinor/fusion/lib/auth/AuthContainer';
import { LegacyAuthUser } from './LegacyAuthUser';

import type { PortalFramework } from './types';

const global = window as unknown as Window & { clientId: string };

// TODO - get from msal module
type BrowserAuthError = {
    errorCode: string;
    /**
     * Detailed description of error
     */
    errorMessage: string;
    /**
     * Describes the subclass of an error
     */
    subError: string;
    /**
     * CorrelationId associated with the error
     */
    correlationId: string;
};

export class LegacyAuthContainer extends AuthContainer {
    #auth: PortalFramework['modules']['auth'];

    constructor(args: { auth: PortalFramework['modules']['auth'] }) {
        super();
        this.#auth = args.auth;
    }

    get account(): AccountInfo | undefined {
        return this.#auth.defaultClient.account;
    }

    public async requiresAuth(): Promise<void> {
        await this.#auth.handleRedirect();
        const { account } = this;
        // TODO - move logic to fusion framework
        const valid =
            account && (account.idTokenClaims as { exp: number })?.exp > Date.now() / 1000;
        if (!valid) {
            try {
                await this.#auth.login();
            } catch (e) {
                const { errorCode } = e as BrowserAuthError;
                if (errorCode === 'interaction_in_progress') {
                    if (!(await this.#auth.handleRedirect())) {
                        window.sessionStorage.clear();
                        window.location.reload();
                    }
                }
            }
        }
    }

    async loginAsync(clientId: string): Promise<void> {
        await this.#auth.handleRedirect();
        if (this._registeredApps[clientId]) {
            return this.#auth.login();
        }
        console.trace(`FusionAuthContainer::loginAsync for client id [${clientId}]`);
        return super.loginAsync(clientId);
    }

    /**
     * dunno if we kan handle single logout for a client id?
     */
    public async logoutAsync(clientId?: string): Promise<void> {
        console.trace(`FusionAuthContainer::logoutAsync for client id [${clientId}]`);
        // TODO
        if (!clientId || this._registeredApps[clientId]) {
            return this.#auth.defaultClient.logoutRedirect({
                postLogoutRedirectUri: '/sign-out',
                account: this.account,
            });
        }
        await super.logoutAsync(clientId);
        window.location.href = '/sign-out';
    }

    async getCachedUserAsync(): Promise<AuthUser> {
        return this.getCachedUser();
    }

    getCachedUser(): AuthUser {
        if (!this.account) {
            throw Error('no logged in user!');
        }
        return new LegacyAuthUser(this.account) as unknown as AuthUser;
    }

    async acquireTokenAsync(resource: string): Promise<string | null> {
        // window.Fusion
        const app = this.resolveApp(resource);
        if (app === null) {
            throw new FusionAuthAppNotFoundError(resource);
        }
        if (this._registeredApps[app.clientId]) {
            // TODO
            const defaultScope = app.clientId + '/.default';
            const res = await this.#auth.acquireToken({ scopes: [defaultScope] });
            if (res && res.accessToken) {
                return res.accessToken;
            }
            // if (!accessToken) {
            throw Error('failed to aquire token');
            // }
            // return accessToken;
        }
        console.trace(`FusionAuthContainer::acquireTokenAsync ${resource}`);
        return super.acquireTokenAsync(resource);
    }

    /** internal registry of 'new' apps registred for msal */
    protected _registeredApps: Record<string, AuthApp> = {};
    async registerAppAsync(clientId: string, resources: string[], legacy = true): Promise<boolean> {
        const isRegistered = !!this._registeredApps[clientId];
        if (!isRegistered && legacy) {
            console.warn(`registering legacy client for [${clientId}]`);
            return super.registerAppAsync(clientId, resources);
        }
        resources = resources.filter(Boolean);
        const app = this.resolveApp(clientId) ?? new AuthApp(clientId, resources);
        app.updateResources(resources);
        this._registeredApps[clientId] = app;
        this.apps.push(app);
        return true;
    }

    /**
     * @deprecated
     */
    protected async refreshTokenAsync(resource: string): Promise<string | null> {
        console.trace(`FusionAuthContainer::refreshTokenAsync legacy for resource [${resource}]`);
        const app = this.resolveApp(resource);

        if (app && app.clientId === global.clientId) {
            const refreshUrl = `/auth/refresh`;
            try {
                const response = await fetch(refreshUrl, {
                    credentials: 'include',
                    method: 'POST',
                });

                if (response.status === 200) {
                    return response.text();
                }
            } catch (err) {
                // @todo AI
                console.error(err);
            }
        }

        return super.refreshTokenAsync(resource);
    }
}

export default LegacyAuthContainer;
