/**
 * Mock context module for tests: real provider, real configurator, in-memory data.
 *
 * @remarks
 * Substituting the data source is the smallest change that removes the context
 * API, HTTP mocking, and service-discovery mocking from a test. Everything
 * above it — validation, resolution, parent-context propagation, initial-context
 * selection — is the production code path.
 *
 * This is one of two ways to mock context data in tests: a small, static,
 * in-memory pool (this module — no HTTP layer involved at all). The other is
 * mocking the context API's HTTP responses directly (e.g. with MSW), which
 * exercises the real `ContextModuleConfigurator`/services/HTTP pipeline —
 * reach for that instead when the test needs to cover that pipeline itself.
 * For fixture generators with realistic fake data, see
 * `@equinor/fusion-framework-module-context/mock/fixtures`.
 *
 * @example
 * ```typescript
 * import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
 *
 * enableContextMock(configurator, (mock) => {
 *   mock.setCurrentContext({ id: 'my-ctx', type: { id: 'ProjectMaster' }, value: {} });
 * });
 * ```
 *
 * @packageDocumentation
 */
export {
  ContextMockConfigurator,
  type ContextResolverFn,
} from './ContextMockConfigurator';
export { enableContextMock, contextMockModule, type ContextMockConfigFn } from './module';
