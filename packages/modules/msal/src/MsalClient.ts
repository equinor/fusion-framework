import {
  PublicClientApplication,
  type SilentRequest,
  type Configuration,
  type EndSessionRequest,
  type PopupRequest,
  type RedirectRequest,
} from '@azure/msal-browser';

import type {
  IMsalClient,
  AcquireTokenResult,
  LoginOptions,
  LogoutOptions,
  LoginResult,
  AcquireTokenOptions,
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

  async login(options: Required<LoginOptions>): Promise<LoginResult> {
    // if silent is true and a login hint is provided, try to login silently
    if (options.silent) {
      if (!options.request.account && !options.request.loginHint) {
        this.getLogger().warning(
          'No account or login hint provided, please provide an account or login hint in the request',
        );
      }
      try {
        return await this.ssoSilent(options.request as SilentRequest);
      } catch {
        this.getLogger().warning('Silent login failed, falling back to interactive');
      }
    }

    // if behavior is popup, login via popup
    switch (options.behavior) {
      case 'popup':
        return await this.loginPopup(options.request as PopupRequest);
      case 'redirect':
        await this.loginRedirect(options.request as RedirectRequest);
        break;
      default:
        throw new Error(
          `Invalid behavior provided: ${options.behavior}, please provide a valid behavior, see options.behavior for more information.`,
        );
    }
  }

  async logout(options?: LogoutOptions): Promise<void> {
    if (!options?.account) {
      this.getLogger().warning(
        'No account available for logout, please provide an account in the options',
      );
    }

    const logoutRequest: EndSessionRequest = {
      account: options?.account,
      postLogoutRedirectUri: options?.redirectUri,
    };

    await this.logoutRedirect(logoutRequest);
  }

  async acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult> {
    const { behavior = 'redirect', silent = !!options.request?.account, request } = options;

    if (!request) {
      throw new Error('No request provided, please provide a request in the options');
    }

    if (request.scopes.length === 0) {
      this.getLogger().warning(
        'No scopes provided, please provide scopes in the request option, see options.request for more information.',
      );
    }

    if (silent) {
      if (request.account) {
        try {
          this.getLogger().verbose('Attempting to acquire token silently');
          return await this.acquireTokenSilent(request as SilentRequest);
        } catch {
          this.getLogger().warning('Silent token acquisition failed, falling back to interactive');
        }
      } else {
        this.getLogger().warning(
          'Cannot acquire token silently, no account provided, falling back to interactive.',
        );
      }
    }

    switch (behavior) {
      case 'popup':
        return await this.acquireTokenPopup(request);
      case 'redirect':
        await this.acquireTokenRedirect(request);
        break;
      default:
        throw new Error(
          `Invalid behavior provided: ${behavior}, please provide a valid behavior, see options.behavior for more information.`,
        );
    }
  }
}
