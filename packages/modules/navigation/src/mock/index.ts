/**
 * Mock navigation module for tests: real provider, real configurator,
 * in-memory history.
 *
 * @remarks
 * Forcing {@link MemoryHistory} is the smallest change that removes real
 * browser navigation — and its cross-test leakage — from a test. Everything
 * above it — the `NavigationProvider`, basename localization, and
 * navigate/push/replace flows — is the production code path.
 *
 * @example
 * ```typescript
 * import { enableNavigationMock } from '@equinor/fusion-framework-module-navigation/mock';
 *
 * enableNavigationMock(configurator, {
 *   configure: (config) => config.setInitialLocation('/users/42'),
 * });
 * ```
 *
 * @packageDocumentation
 */
export { NavigationMockConfigurator } from './NavigationMockConfigurator';
export { enableNavigationMock, navigationMockModule, type NavigationMockConfigFn } from './module';
