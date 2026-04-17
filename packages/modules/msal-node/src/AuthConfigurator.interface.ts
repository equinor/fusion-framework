import type { DeviceCodeRequest, PublicClientApplication } from '@azure/msal-node';

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
 * Configuration type for the device code authentication mode.
 *
 * In this mode the user is shown a short code and a URL (`https://microsoft.com/devicelogin`).
 * They open the URL on any device, enter the code, and authenticate there.
 * No local HTTP server is required, making this the recommended mode for CLI tools.
 *
 * @property mode - Specifies the authentication mode as `'device_code'`.
 * @property client - An instance of `PublicClientApplication` used for authentication.
 * @property deviceCodeCallback - Optional callback invoked with the device code response.
 *   Receives the full {@link DeviceCodeRequest.deviceCodeCallback} response containing
 *   `userCode`, `verificationUri`, `message`, and expiry details.
 *   Defaults to printing `response.message` to `console.log`.
 * @property parent - An optional parent `IAuthProvider` instance for delegation.
 */
type AuthConfigDeviceCodeMode = {
  mode: 'device_code';
  client: PublicClientApplication;
  deviceCodeCallback?: DeviceCodeRequest['deviceCodeCallback'];
  server?: never;
  accessToken?: never;
  parent?: IAuthProvider;
};

/**
 * Represents the configuration options for authentication.
 *
 * This type is a union of four different authentication modes:
 * - `AuthConfigInteractiveMode`: Browser-based login with a local callback server.
 * - `AuthConfigSilentMode`: Silent authentication using cached/refreshed tokens.
 * - `AuthConfigTokenMode`: Static pre-obtained token passthrough (CI/CD, automation).
 * - `AuthConfigDeviceCodeMode`: Device code flow — prints a code for the user to enter at a URL. Recommended for CLI tools.
 */
export type AuthConfig =
  | AuthConfigInteractiveMode
  | AuthConfigSilentMode
  | AuthConfigTokenMode
  | AuthConfigDeviceCodeMode;

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
 * - `device_code`: Use MSAL's device code flow — prints a code for the user to enter at `https://microsoft.com/devicelogin`. No local server required. **Recommended for CLI tools.**
 *
 * Consumers should use the provided methods to configure the module according to their use case.
 * Maintainers should ensure that new authentication flows or configuration options are exposed via this interface for consistency.
 *
 * @example
 * // --- Device code mode (recommended for CLI tools) ---
 * ```ts
 * builder.setMode('device_code');
 * builder.setClientConfig('your-tenant-id', 'your-client-id');
 * // Optional: customise the output shown to the user
 * builder.setDeviceCodeCallback((response) => console.log(response.message));
 * ```
 *
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
   * @param mode - The authentication mode to use: `'token_only'`, `'silent'`, `'interactive'`, or `'device_code'`.
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

  /**
   * Sets a callback invoked with the device code response during `device_code` authentication.
   *
   * The callback receives a `DeviceCodeResponse` containing `userCode`, `verificationUri`,
   * `message`, and expiry information. Typically used to display the code and URL to the user.
   *
   * If not set, the default behaviour is to print `response.message` to `console.log`.
   *
   * @param callback - The callback function, or `undefined` to restore the default.
   *
   * @example
   * ```ts
   * builder.setMode('device_code');
   * builder.setClientConfig('your-tenant-id', 'your-client-id');
   * builder.setDeviceCodeCallback((response) => {
   *   console.log(`\nAuthenticate at: ${response.verificationUri}`);
   *   console.log(`Enter code: ${response.userCode}\n`);
   * });
   * ```
   */
  setDeviceCodeCallback(callback: DeviceCodeRequest['deviceCodeCallback'] | undefined): void;
}
