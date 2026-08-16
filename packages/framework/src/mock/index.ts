/**
 * Zero-configuration Fusion Framework instances for tests.
 *
 * @remarks
 * Lets an application initialize the real framework — real modules, real
 * configuration pipeline, real lifecycle — while the boundaries that reach
 * outside the process are substituted with deterministic fakes. No credentials,
 * no network access and no configuration are required.
 *
 * This entry point holds **no mock logic**. Each module owns and exports its own
 * test double from its `./mock` entry point; this entry point only composes the
 * built-in set into a ready-to-use instance. An application module follows the
 * same pattern and plugs in identically.
 *
 * This entry point is test-runner agnostic: it contains no dependency on Vitest
 * or any other test framework, so the same helpers work under any runner.
 *
 * Fixture generators with realistic fake data (e.g. `createContextItems`) live
 * on each module's own `/mock/fixtures` entry point instead of here, since they
 * pull in an extra dependency ({@link https://fakerjs.dev/ | faker}) that
 * plain configurator mocking doesn't need.
 *
 * @packageDocumentation
 */

export { mockFramework, type FrameworkMockConfigureFn } from './mock-framework.js';
export { FrameworkMockConfigurator } from './FrameworkMockConfigurator.js';

// Re-exported so a test can reach the built-in module mocks without importing
// each module's `./mock` entry point directly. The mocks are owned by their modules.
export {
  enableMsalMock,
  msalMockModule,
  MsalMockConfigurator,
  MsalMockClient,
  createMsalMockClient,
  createMockToken,
  type AuthConfigMockFn,
  type MsalMockUser,
  type MockTokenClaims,
} from '@equinor/fusion-framework-module-msal/mock';

export {
  mockServiceDiscovery,
  enableServiceDiscoveryMock,
  serviceDiscoveryMockModule,
  ServiceDiscoveryMockClient,
  ServiceDiscoveryMockConfigurator,
  createMockService,
  defaultServiceDiscoveryMockServices,
  type ServiceDiscoveryConfigMockFn,
  type MockService,
  type ServiceDiscoveryMockClientOptions,
} from '@equinor/fusion-framework-module-service-discovery/mock';

export {
  enableContextMock,
  contextMockModule,
  ContextMockConfigurator,
  type ContextMockConfigFn,
  type ContextResolverFn,
} from '@equinor/fusion-framework-module-context/mock';
