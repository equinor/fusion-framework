import { AuthApp, AuthContainer, type AuthUser } from '@equinor/fusion';
import type { AccountInfo } from '@equinor/fusion-framework-module-msal';
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
    return this.#auth.defaultAccount;
  }

  public async requiresAuth(): Promise<void> {
    await this.#auth.handleRedirect();
    const { account } = this;
    // TODO - move logic to fusion framework
    const valid = account && (account.idTokenClaims as { exp: number })?.exp > Date.now() / 1000;
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
      return this.#auth.logout({
        redirectUri: '/sign-out',
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
      return this.__acquireTokenAsync(app);
    }
    console.trace(`FusionAuthContainer::acquireTokenAsync ${resource}`);
    return super.acquireTokenAsync(resource);
  }

  protected async __acquireTokenAsync(app: AuthApp): Promise<string | null> {
    const defaultScope = app.clientId + '/.default';
    const res = await this.#auth.acquireToken({ scopes: [defaultScope] });
    if (res?.accessToken) {
      return res.accessToken;
    }
    throw Error('failed to aquire token');
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
    const app = this.resolveApp(clientId);
    if (app) {
      app.updateResources(resources);
      return true;
    }

    const newApp = new AuthApp(clientId, resources);
    this._registeredApps[clientId] = newApp;
    this.apps.push(newApp);
    return true;
  }

  /**
   * @deprecated
   */
  protected async refreshTokenAsync(resource: string): Promise<string | null> {
    console.trace(`FusionAuthContainer::refreshTokenAsync legacy for resource [${resource}]`);
    const app = this.resolveApp(resource);

    if (app && app.clientId === global.clientId) {
      return this.__acquireTokenAsync(app);
    }

    return super.refreshTokenAsync(resource);
  }
}

export default LegacyAuthContainer;
