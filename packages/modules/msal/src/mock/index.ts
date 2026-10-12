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
 * // or a runtime token source
 * enableMsalMock(configurator, (builder) => {
 *   builder.setAcquireToken(({ scopes }) => issueToken(scopes));
 * });
 * ```
 *
 * @packageDocumentation
 */
export { MsalMockClient } from './MsalMockClient.js';
export type { MsalMockTokenAcquirer, MsalMockTokenRequest } from './types.js';
export { createMsalMockClient } from './create-msal-mock-client.js';
export { MsalMockConfigurator } from './MsalMockConfigurator.js';
export { enableMsalMock, msalMockModule, type AuthConfigMockFn } from './module.js';
export { createMockToken, type MockTokenClaims } from './create-mock-token.js';
export { decodeJwtSegment } from './decode-jwt-segment.js';
