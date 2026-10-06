/**
 * Test doubles for the Service Discovery module.
 *
 * @remarks
 * Imported from `@equinor/fusion-framework-module-service-discovery/mock`, so the
 * mock ships and versions with the implementation it stands in for.
 *
 * The mock is injected through the module's own `setServiceDiscoveryClient`
 * configuration, so the real configuration builder still runs and validates — only
 * the boundary that would contact the service registry is substituted.
 *
 * This entry point has no dependency on any test runner.
 *
 * @packageDocumentation
 */

export {
  ServiceDiscoveryMockClient,
  type ServiceDiscoveryMockClientOptions,
} from './ServiceDiscoveryMockClient.js';
export { ServiceDiscoveryMockConfigurator } from './ServiceDiscoveryMockConfigurator.js';
export { createMockService, type MockService } from './create-mock-service.js';
export { defaultServiceDiscoveryMockServices } from './default-service-discovery-mock-services.js';
export { mockServiceDiscovery } from './mock-service-discovery.js';
export {
  enableServiceDiscoveryMock,
  serviceDiscoveryMockModule,
  type ServiceDiscoveryConfigMockFn,
} from './module.js';
