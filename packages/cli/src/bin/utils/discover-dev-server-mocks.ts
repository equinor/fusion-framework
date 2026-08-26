import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';

import { importConfig } from '@equinor/fusion-imports';
import type { FusionService } from '@equinor/fusion-framework-dev-server';

const DEV_SERVER_MOCKS_PATTERN = /\.mock\.(?:ts|mjs|js)$/;

interface LocalMockService {
  key: string;
  serviceDiscovery: false | 'merge' | 'new' | 'replace';
}

/** Discovery-visible local mock service used by normal app development. */
export interface DevServerMockService extends FusionService {
  /** Controls collision behavior when overlaying upstream service discovery. */
  serviceDiscovery: Exclude<LocalMockService['serviceDiscovery'], false>;
}

/** Validates one `defineService` export before it contributes to normal dev discovery. */
function assertLocalMockService(value: unknown, fileName: string): LocalMockService {
  // Mock modules must export one object produced by defineService.
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected "${fileName}" to default-export defineService({...}).`);
  }
  const service = value as Partial<LocalMockService>;
  // Every local proxy needs a stable service-discovery key.
  if (typeof service.key !== 'string' || !service.key) {
    throw new Error(`Expected "${fileName}" to provide a non-empty service key.`);
  }
  // Keep discovery behavior aligned with the standalone mock-server contract.
  if (
    service.serviceDiscovery !== false &&
    service.serviceDiscovery !== 'merge' &&
    service.serviceDiscovery !== 'new' &&
    service.serviceDiscovery !== 'replace'
  ) {
    throw new Error(`Expected "${fileName}" to declare a valid serviceDiscovery mode.`);
  }
  return service as LocalMockService;
}

/** Loads one local mock service module from disk. */
async function loadLocalMockService(
  directory: string,
  fileName: string,
): Promise<LocalMockService> {
  const extension = extname(fileName);
  const basename = fileName.slice(0, -extension.length);
  const { config } = await importConfig(basename, {
    baseDir: directory,
    extensions: [extension],
  });
  return assertLocalMockService(config, fileName);
}

/**
 * Discovers visible `defineService` modules for normal-development proxying.
 *
 * @param directory - Directory scanned non-recursively for dev-server mock definitions.
 * @param port - Manually started standalone mock-server port.
 * @returns Local service-discovery entries in deterministic filename order.
 * @throws {Error} When the directory cannot be read or a discovered module has an invalid export.
 */
export async function discoverDevServerMocks(
  directory: string,
  port: number,
): Promise<DevServerMockService[]> {
  let files: string[];
  try {
    files = await readdir(directory);
  } catch (error) {
    // Most apps have no normal-dev mocks directory; only a missing directory is an empty result.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const moduleFiles = files
    // Only executable mock modules participate in normal dev integration.
    .filter((fileName) => DEV_SERVER_MOCKS_PATTERN.test(fileName))
    .sort();
  const definitions = await Promise.all(
    moduleFiles
      // Modules load in parallel while sorted filenames preserve composition order.
      .map((fileName) => loadLocalMockService(directory, fileName)),
  );

  return (
    definitions
      // Direct-only definitions remain reachable explicitly but do not replace real discovery.
      .filter(
        (
          definition,
        ): definition is LocalMockService & {
          serviceDiscovery: DevServerMockService['serviceDiscovery'];
        } => definition.serviceDiscovery !== false,
      )
      // Match the standalone server's `<key>.localhost` addressing convention.
      .map((definition) => ({
        key: definition.key,
        name: `${definition.key} mock`,
        uri: `http://${definition.key}.localhost:${port}`,
        serviceDiscovery: definition.serviceDiscovery,
      }))
  );
}

export default discoverDevServerMocks;
