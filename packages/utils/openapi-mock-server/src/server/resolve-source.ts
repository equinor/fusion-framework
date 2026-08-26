import { discoverServices, type ServiceMockDefinition } from '../discovery/discover-services.js';
import { presets } from '../presets/index.js';
import type { MockSource } from './types.js';

/**
 * Resolves one registered {@link MockSource} to its definition group.
 *
 * @param source - A directory to scan, a bundled preset name, or an already-resolved definition group.
 * @returns The resolved service mock definitions.
 */
export async function resolveSource(source: MockSource): Promise<ServiceMockDefinition[]> {
  // Already-resolved (e.g. built in code via createService()).
  if (Array.isArray(source)) return source;
  // A bundled preset name (see `presets/index.ts`) needs no filesystem access.
  const preset = presets[source];
  // A registered preset name: load its specs lazily, only now that it's actually used.
  if (preset) return Object.values(await preset());
  // Anything else is a directory of specs to scan.
  return discoverServices(source);
}
