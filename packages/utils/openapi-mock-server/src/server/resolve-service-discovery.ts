import type { ServiceMockDefinition } from '../discovery/discover-services.js';
import type { ServiceDiscoveryEntry } from './types.js';

/**
 * Resolves local mock definitions into the mock server's service-discovery response.
 *
 * @param definitions - Active local mock definitions in registration order.
 * @param port - Listening port used to build each local `<key>.localhost` URI.
 * @returns The discovery response exposed by the mock server.
 */
export function resolveServiceDiscovery(
  definitions: Iterable<ServiceMockDefinition>,
  port: string,
): ServiceDiscoveryEntry[] {
  const entries: ServiceDiscoveryEntry[] = [];

  // Expose each resolved local definition unless it is explicitly direct-only.
  for (const definition of definitions) {
    const mode = definition.serviceDiscovery ?? 'replace';
    // Direct-only services remain routable without being advertised to framework discovery.
    if (mode === false) {
      // Hidden services require no discovery entry.
      continue;
    }

    entries.push({
      key: definition.key,
      uri: `http://${definition.key}.localhost:${port}`,
    });
  }

  return entries;
}

export default resolveServiceDiscovery;
