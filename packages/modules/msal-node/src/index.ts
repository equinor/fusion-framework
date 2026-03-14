/**
 * `@equinor/fusion-framework-module-msal-node` provides Azure AD authentication
 * for Node.js applications using Microsoft's MSAL library.
 *
 * Supports three authentication modes:
 * - **interactive** — browser-based login with a local callback server (CLI tools, development)
 * - **silent** — cached credential reuse without user interaction (background services)
 * - **token_only** — static pre-obtained token passthrough (CI/CD, automation)
 *
 * @example
 * ```typescript
 * import { enableAuthModule } from '@equinor/fusion-framework-module-msal-node';
 *
 * enableAuthModule(configurator, (builder) => {
 *   builder.setMode('interactive');
 *   builder.setClientConfig('your-tenant-id', 'your-client-id');
 * });
 * ```
 *
 * @packageDocumentation
 */

export { AuthProvider } from './AuthProvider.js';

export type { IAuthProvider } from './AuthProvider.interface.js';

export type { IAuthConfigurator, AuthConfig } from './AuthConfigurator.interface.js';

export { module as authModule, type MsalNodeModule } from './module.js';

export { enableModule as enableAuthModule } from './enable-module.js';
