import type { DeviceCodeRequest } from '@azure/msal-node';

import type { AuthenticationResult, PublicClientApplication } from '@azure/msal-node';

import { AuthProvider } from './AuthProvider.js';
import { SilentTokenAcquisitionError } from './error.js';

/**
 * Authentication provider that uses the OAuth 2.0 device code flow.
 *
 * When an access token cannot be acquired silently, the provider calls
 * `acquireTokenByDeviceCode` and invokes `deviceCodeCallback` with the
 * response containing `userCode`, `verificationUri`, and `message`.
 * The user opens the URL on any device, enters the code, and authenticates.
 * No local HTTP server is required, making this the recommended mode for CLI tools.
 *
 * @example
 * ```ts
 * const provider = new AuthProviderDeviceCode(msalClient, {
 *   deviceCodeCallback: (response) => console.log(response.message),
 * });
 * ```
 *
 * @see AuthProviderInteractive - Browser-based login with a local callback server.
 * @see AuthProvider - Silent-only provider (base class).
 */
export class AuthProviderDeviceCode extends AuthProvider {
  readonly #deviceCodeCallback: DeviceCodeRequest['deviceCodeCallback'];

  /**
   * Creates an instance of `AuthProviderDeviceCode`.
   *
   * @param client - The MSAL `PublicClientApplication` to use for token acquisition.
   * @param options - Configuration options.
   * @param options.deviceCodeCallback - Callback invoked with the device code response.
   *   Defaults to printing `response.message` to `console.log`.
   */
  constructor(
    client: PublicClientApplication,
    options?: {
      deviceCodeCallback?: DeviceCodeRequest['deviceCodeCallback'];
    },
  ) {
    super(client);
    this.#deviceCodeCallback =
      options?.deviceCodeCallback ?? ((response) => console.log(response.message));
  }

  /**
   * Acquires an access token for the specified scopes.
   *
   * First attempts silent acquisition using the cached account.
   * If that fails (e.g. no account or new resource requiring consent),
   * falls back to the device code flow — invoking `deviceCodeCallback` so
   * the user can authenticate on any device.
   *
   * @param options - Token request options.
   * @param options.request.scopes - OAuth 2.0 scopes to request.
   * @returns A promise resolving to an `AuthenticationResult`.
   * @throws {@link SilentTokenAcquisitionError} If device code acquisition also fails.
   */
  public override async acquireToken(options: {
    request: { scopes: string[] };
  }): Promise<AuthenticationResult> {
    // Attempt silent acquisition first (uses cached account / refresh token)
    const account = await this.getAccount();
    if (account) {
      try {
        return await this._client.acquireTokenSilent({
          scopes: options.request.scopes,
          account,
        });
      } catch {
        // Silent failed — fall through to device code flow below
      }
    }

    // Fall back to device code flow
    try {
      const result = await this._client.acquireTokenByDeviceCode({
        scopes: options.request.scopes,
        deviceCodeCallback: this.#deviceCodeCallback,
      });
      if (!result) {
        throw new SilentTokenAcquisitionError('Device code flow returned no result');
      }
      return result;
    } catch (error) {
      throw new SilentTokenAcquisitionError('Device code token acquisition failed', {
        cause: error,
      });
    }
  }

  /**
   * Initiates the device code login flow explicitly.
   *
   * This is equivalent to calling `acquireToken` and is provided to satisfy
   * the `IAuthProvider` contract.
   *
   * @param options - Login options containing the requested scopes.
   * @returns A promise resolving to an `AuthenticationResult`.
   */
  public override async login(options: {
    request: { scopes: string[] };
  }): Promise<AuthenticationResult> {
    return this.acquireToken(options);
  }
}
