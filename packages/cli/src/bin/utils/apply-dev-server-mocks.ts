import {
  processServices,
  type DevServerOptions,
  type FusionService,
} from '@equinor/fusion-framework-dev-server';
import type { DevServerMockService } from './discover-dev-server-mocks.js';

/**
 * Adds discovered local mock services to a dev-server configuration.
 *
 * @param config - Loaded dev-server configuration, including any user-defined processor and routes.
 * @param mocks - Local services derived from visible `defineService` modules.
 * @returns A configuration where local services replace real entries by key.
 * @throws {Error} When a mock marked as new collides with upstream service discovery.
 */
export function applyDevServerMocks(
  config: DevServerOptions,
  mocks: DevServerMockService[],
): DevServerOptions {
  const configuredProcessor = config.api.processServices ?? processServices;
  const localKeys = new Set(
    mocks
      // Index local keys so their entries can replace matching real discovery services.
      .map((service) => service.key),
  );

  return {
    ...config,
    api: {
      ...config.api,
      processServices(data, args) {
        // Preserve the configured processor's own invalid-input behavior.
        if (!Array.isArray(data)) {
          return configuredProcessor(data, args);
        }
        const upstreamKeys = new Set(
          data
            // Index upstream keys so pre-production mocks cannot shadow registered services.
            .map((service: FusionService) => service.key),
        );
        // Find the first invalid pre-production mock to produce a deterministic error.
        const collision = mocks.find(
          (service) => service.serviceDiscovery === 'new' && upstreamKeys.has(service.key),
        );
        // A pre-production service must stop shadowing discovery once the backend is registered.
        if (collision) {
          throw new Error(
            `Mock service "${collision.key}" is marked as new but already exists in upstream service discovery.`,
          );
        }
        // Keep unrelated real services while local definitions replace matching keys.
        const upstream = data.filter((service: FusionService) => !localKeys.has(service.key));
        const localServices = mocks
          // Remove local collision metadata before invoking the configured public processor.
          .map(({ serviceDiscovery: _, ...service }) => service);
        // Local replacements follow real entries so the configured processor sees one entry per key.
        return configuredProcessor([...upstream, ...localServices], args);
      },
    },
  };
}

export default applyDevServerMocks;
