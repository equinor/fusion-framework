import type { PublicClientApplication } from '@azure/msal-node';

import type { IAuthProvider } from './AuthProvider.interface.js';

/**
 * Represents the configuration for authentication in "token only" mode.
 *
 * @property mode - Specifies the authentication mode as 'token_only'.
 * @property accessToken - The authentication token to be used.
 * @property parent - An optional reference to a parent authentication provider.
 */
type AuthConfigTokenMode = {
  mode: 'token_only';
  accessToken: string;
  client?: never;
  server?: never;
  parent?: IAuthProvider;
};

/**
 * Configuration type for silent authentication mode.
 *
 * @property mode - Specifies the authentication mode as 'silent'.
 * @property client - An instance of `PublicClientApplication` used for authentication.
 * @property parent - An optional parent `IAuthProvider` instance for delegation.
 */
type AuthConfigSilentMode = {
  mode: 'silent';
  client: PublicClientApplication;
  server?: never;
  accessToken?: never;
  parent?: IAuthProvider;
};

/**
 * Configuration type for the interactive authentication mode.
 *
 * @property mode - Specifies the authentication mode as 'interactive'.
 * @property client - An instance of `PublicClientApplication` used for authentication.
 * @property server - Configuration for the local server used during the interactive authentication process.
 * @property server.port - The port number on which the local server will run.
 * @property server.onOpen - An optional callback function that is invoked with the authentication URL when the server starts.
 * @property parent - An optional parent `IAuthProvider` instance for delegation or chaining of authentication providers.
 */
type AuthConfigInteractiveMode = {
  mode: 'interactive';
  client: PublicClientApplication;
  server: {
    port: number;
    onOpen?: (url: string) => void;
  };
  accessToken?: never;
  parent?: IAuthProvider;
};

/**
 * Represents the configuration options for authentication.
 *
 * This type is a union of three different authentication modes:
 * - `AuthConfigInteractiveMode`: Configuration for interactive authentication.
 * - `AuthConfigSilentMode`: Configuration for silent authentication.
 * - `AuthConfigTokenMode`: Configuration for token-based authentication.
 */
export type AuthConfig = AuthConfigInteractiveMode | AuthConfigSilentMode | AuthConfigTokenMode;

/**
 * Interface for configuring authentication settings for the MSAL Node module.
 *
 * This interface is intended for both consumers (users integrating authentication into their Fusion Framework Node.js applications)
 * and future maintainers or developers extending or refactoring the module.
 *
 * Each method allows for fine-grained control over the authentication setup, supporting multiple authentication modes:
 * - `token_only`: Use a pre-obtained access token (e.g., for CI/CD or automation).
 * - `silent`: Use MSAL's silent authentication with a configured client (for background services or cached tokens).
 * - `interactive`: Use MSAL's interactive authentication, typically for CLI tools or development, with a local server for browser-based login.
 *
 * Consumers should use the provided methods to configure the module according to their use case.
 * Maintainers should ensure that new authentication flows or configuration options are exposed via this interface for consistency.
 *
 * @example
 * // --- Interactive mode (browser login, local server) ---
 * ```ts
 * builder.setMode('interactive');
 * builder.setClientConfig('your-tenant-id', 'your-client-id');
 * builder.setServerPort(3000);
 * builder.setServerOnOpen((url) => {
 *   console.log(`Please navigate to: ${url}`);
 * });
 * ```
 *
 * // --- Silent mode (background, cached/refresh tokens) ---
 * ```ts
 * builder.setMode('silent');
 * builder.setClientConfig('your-tenant-id', 'your-client-id');
 * ```
 *
 * // --- Token only mode (pre-obtained token, CI/CD) ---
 * ```ts
 * builder.setMode('token_only');
 * builder.setAccessToken('your-access-token');
 */
export interface IAuthConfigurator {
  /**
   * Sets the authentication mode for the module.
   *
   * @param mode - The authentication mode to use: 'token_only', 'silent', or 'interactive'.
   *
   * Consumers: Call this first to define the overall authentication strategy.
   * Maintainers: Add new modes here if supporting additional auth flows.
   */
  setMode(mode: AuthConfig['mode']): void;

  /**
   * Sets the MSAL client instance for authentication.
   *
   * @param client - The MSAL PublicClientApplication instance to use for authentication.
   *
   * Consumers: Use this to provide a custom MSAL client if needed.
   * Maintainers: Ensure compatibility with MSAL updates and custom client options.
   */
  setClient(client: AuthConfig['client']): void;

  /**
   * Configures the MSAL client using tenant and client IDs.
   *
   * @param tenantId - Azure AD tenant ID.
   * @param clientId - Azure AD client/application ID.
   *
   * Consumers: Use this for quick setup without manually creating a client instance.
   * Maintainers: Update this if the client configuration contract changes.
   */
  setClientConfig(tenantId: string, clientId: string): void;

  /**
   * Sets the port for the local server (used in interactive mode for auth callbacks).
   *
   * @param port - The port number for the local HTTP server.
   *
   * Consumers: Use this to avoid port conflicts or customize the callback endpoint.
   * Maintainers: Ensure this is respected in server setup logic.
   */
  setServerPort(port: number): void;

  /**
   * Sets a callback to be invoked when the local server opens (interactive mode).
   *
   * @param onOpen - Callback receiving the server URL when ready, or undefined to disable.
   *
   * Consumers: Use this to display or log the login URL for users.
   * Maintainers: Update this if the server startup flow changes.
   */
  setServerOnOpen(onOpen: ((url: string) => void) | undefined): void;

  /**
   * Sets a pre-obtained access token for token_only mode.
   *
   * @param token - The access token to use for authentication.
   *
   * Consumers: Use this for automation or CI/CD scenarios.
   * Maintainers: Ensure this is securely handled and not mixed with other modes.
   */
  setAccessToken(token: string): void;
}
