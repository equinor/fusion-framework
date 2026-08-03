/**
 * Mock MSAL for tests: real provider, real configurator, fake client.
 *
 * @remarks
 * Substituting the client is the smallest change that removes Entra ID from a test.
 * Everything above it — scope resolution, silent-first token acquisition, account
 * handling, proxy providers, telemetry — is the production code path.
 *
 * @example
 * ```typescript
 * import { enableMsalMock } from '@equinor/fusion-framework-module-msal/mock';
 *
 * // default mock user
 * enableMsalMock(configurator);
 *
 * // or a specific one
 * enableMsalMock(configurator, (builder) => {
 *   builder.setAccount({ name: 'Ada Lovelace', signedOut: true });
 * });
 * ```
 *
 * @packageDocumentation
 */
export { MsalMockClient, type MsalMockUser } from './MsalMockClient';
export { createMsalMockClient } from './create-msal-mock-client';
export { MsalMockConfigurator } from './MsalMockConfigurator';
export { enableMsalMock, msalMockModule, type AuthConfigMockFn } from './module';
export { createMockToken, type MockTokenClaims } from './create-mock-token';
