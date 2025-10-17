import {
  PublicClientApplication,
  type Configuration,
  type EndSessionRequest,
} from '@azure/msal-browser';

import type {
  IMsalClient,
  AcquireTokenOptions,
  AcquireTokenResult,
  LoginOptions,
  LogoutOptions,
  LoginResult,
} from './MsalClient.interface';

export type { IMsalClient };

export type MsalClientConfig = Configuration & {
  auth: {
    tenantId?: string;
  };
};

export class MsalClient extends PublicClientApplication implements IMsalClient {
  #tenantId?: string;
  #clientId?: string;

  constructor(config: MsalClientConfig) {
    super(config);
    this.#tenantId = config.auth?.tenantId;
    this.#clientId = config.auth?.clientId;
  }

  get requestOrigin(): string | null {
    // biome-ignore lint/suspicious/noTsIgnore: suppressing, since this exists
    // @ts-ignore - base class ClientApplication is not exported from @azure/msal-browser
    return this.browserStorage.getTemporaryCache('request.origin', true) as string | null;
  }

  get tenantId(): string | undefined {
    return this.#tenantId;
  }

  get clientId(): string | undefined {
    return this.#clientId;
  }

  get hasValidClaims(): boolean {
    const idTokenClaims = this.getActiveAccount()?.idTokenClaims;
    return Number(idTokenClaims?.exp) > Number(Math.ceil(Date.now() / 1000));
  }

  async login(options: LoginOptions): Promise<LoginResult> {
    const {
      request,
      // by default, use popup behavior
      behavior = 'popup',
      // by default, try to login silently
      silent = true,
    } = options;

    // if no login hint is provided, use the active account's username
    request.loginHint ??= this.getActiveAccount()?.username;

    // if no scopes are provided, use an empty array
    if (!request.scopes) {
      console.warn('No scopes provided, using []');
      request.scopes = [];
    }

    // if silent is true and a login hint is provided, try to login silently
    if (silent && request.loginHint) {
      try {
        return await this.ssoSilent(request);
      } catch (error) {
        console.warn('Silent login failed, falling back to interactive:', error);
      }
    }

    // if behavior is popup, login via popup
    if (behavior === 'popup') {
      return await this.loginPopup(request);
    } else {
      // if behavior is redirect, login via redirect
      await this.loginRedirect(request);
    }
  }

  async logout(options?: LogoutOptions): Promise<void> {
    const account = options?.account || this.getActiveAccount();

    if (!account) {
      console.warn('No account available for logout');
      return;
    }

    const logoutRequest: EndSessionRequest = {
      account: account,
      postLogoutRedirectUri: options?.redirectUri,
    };

    await this.logoutRedirect(logoutRequest);
  }

  async acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult> {
    const {
      request,
      account = this.getActiveAccount(),
      behavior = 'popup',
      silent = true,
    } = options;

    if (silent && account) {
      try {
        return await this.acquireTokenSilent({
          ...request,
          account: account,
        });
      } catch (error) {
        console.warn('Silent token acquisition failed, falling back to interactive:', error);
      }
    }

    switch (behavior) {
      case 'popup':
        return await this.acquireTokenPopup(request);
      case 'redirect':
        await this.acquireTokenRedirect(request);
    }
  }
}
