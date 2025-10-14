import { type AuthClient, createAuthClient, type AuthRequest, ConsoleLogger } from './client';

import { MsalModuleVersion } from '../static';

import type { AuthClientConfig } from './configurator';
import type { AccountInfo, AuthenticationResult } from './types';
import type { IProxyProvider } from '../types';
import { resolveVersion } from '../versioning/resolve-version';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

export interface IAuthProvider {
  // readonly defaultClient: AuthClient;
  /**
   * @deprecated
   */
  // biome-ignore lint/suspicious/noExplicitAny: this is deprecated
  readonly defaultConfig: any | undefined;
  readonly defaultAccount: AccountInfo | undefined;

  readonly client: AuthClient;

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

export class AuthProvider
  extends BaseModuleProvider<AuthClientConfig>
  implements IAuthProvider, IProxyProvider
{
  #client: AuthClient;

  get defaultAccount(): AccountInfo | undefined {
    return this.client.account;
  }

  /** @deprecated */
  get defaultConfig(): AuthClientConfig | undefined {
    return this._config;
  }

  constructor(protected _config: AuthClientConfig) {
    super({
      version: MsalModuleVersion.Latest,
      config: _config,
    });
    this.#client = this.createClient();
  }

  get client(): AuthClient {
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
      const logger = this.client.getLogger();
      const { requestOrigin } = this.client;

      await this.client.handleRedirectPromise();
      if (requestOrigin === redirectUri) {
        logger.warning(`detected callback loop from url ${redirectUri}, redirecting to root`);
        window.location.replace('/');
      } else {
        window.location.replace(requestOrigin || '/');
      }
    }
    return null;
  }

  acquireToken(req: AuthRequest): ReturnType<IAuthProvider['acquireToken']> {
    return this.client.acquireToken(req);
  }

  async acquireAccessToken(req: AuthRequest) {
    const token = await this.acquireToken(req);
    return token ? token.accessToken : undefined;
  }

  async login(options?: { onlyIfRequired?: boolean }) {
    // skip login if already logged in and has valid claims
    if (options?.onlyIfRequired && this.client.hasValidClaims) {
      return;
    }
    await this.client.login();
  }

  async logout(options?: { redirectUri?: string }): Promise<void> {
    // TODO - might have an option for popup or redirect
    await this.client.logoutRedirect({
      postLogoutRedirectUri: options?.redirectUri,
      account: this.defaultAccount,
    });
  }

  createProxyProvider<T = IAuthProvider>(version: string): T {
    // TODO - check if version is supported and telemetry
    const { enumVersion } = resolveVersion(version);
    switch (enumVersion) {
      case MsalModuleVersion.V2:
      case MsalModuleVersion.Latest:
        return this._createProxyProvider_v2() as T;
      default:
        throw new Error(`Version ${version} is not supported`);
    }
  }

  _createProxyProvider_v2(): IAuthProvider {
    const proxy = new Proxy(this, {
      get: (target: AuthProvider, prop: keyof AuthProvider) => {
        switch (prop) {
          case 'version':
            return target.version;
          case 'dispose':
            return target.dispose.bind(target);
          case 'client':
            return target.client;
          // @ts-expect-error this is deprecated since version 5.0.1
          case 'defaultClient':
            console.warn('defaultClient is deprecated, use client instead');
            return target.client;
          case 'defaultAccount':
            return target.defaultAccount;
          case 'defaultConfig':
            return target.defaultConfig;
          case 'acquireToken':
            return target.acquireToken.bind(target);
          case 'acquireAccessToken':
            return target.acquireAccessToken.bind(target);
          case 'login':
            return target.login.bind(target);
          case 'handleRedirect':
            return target.handleRedirect.bind(target);
          case 'createProxyProvider':
            return target.createProxyProvider.bind(target);
        }
      },
    });

    return proxy;
  }
}
