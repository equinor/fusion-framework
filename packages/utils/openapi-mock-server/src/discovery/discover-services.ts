import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';

import { importConfig } from '@equinor/fusion-imports';

import type { FieldFakerMap, OpenApiDocumentLike } from '@equinor/fusion-openapi-mock';
import type { Router } from './create-router.js';
import type { RouteOverride } from './route-override.js';
import type { ServiceDiscoveryMode } from './define-service.js';

const MOCK_MODULE_PATTERN = /\.mock\.(?:ts|mjs|js)$/;

/**
 * One service loaded from a `<name>.mock.ts` module, including its discovery and response behavior.
 */
export interface ServiceMockDefinition {
  /** The mock server's routing key for this service, and its service-discovery `key`. */
  key: string;
  /** Controls how this mock participates in service discovery. Legacy definitions default to replacement behavior. */
  serviceDiscovery?: ServiceDiscoveryMode;
  /** The parsed OpenAPI document. May be omitted by `serviceDiscovery: 'merge'` to retain an earlier definition's schema. */
  document?: OpenApiDocumentLike;
  /** Field-faker behavior flattened from the module's component/property map. */
  fields?: FieldFakerMap;
  /** Declarative route responses keyed by OpenAPI path, then HTTP method. */
  paths?: Record<string, Record<string, RouteOverride>>;
  /** A router checked ahead of this service's declarative and generated mock responses. */
  router?: Router;
}

/**
 * Validates the default export loaded from a mock service module.
 *
 * @param value - Imported module default export.
 * @param fileName - Source filename included in validation errors.
 * @returns A complete service definition.
 * @throws {Error} When the module does not export a valid service definition.
 */
function assertServiceDefinition(value: unknown, fileName: string): ServiceMockDefinition {
  // Mock modules must export one object produced by defineService.
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected "${fileName}" to default-export defineService({...}).`);
  }

  const definition = value as Partial<ServiceMockDefinition>;
  // Every service needs a stable key regardless of whether it inherits an earlier schema.
  if (typeof definition.key !== 'string' || !definition.key) {
    throw new Error(
      `Expected "${fileName}" to default-export defineService({...}) with a non-empty key.`,
    );
  }
  // Discovery behavior must be explicit in every authored mock module.
  if (
    definition.serviceDiscovery !== false &&
    definition.serviceDiscovery !== 'merge' &&
    definition.serviceDiscovery !== 'new' &&
    definition.serviceDiscovery !== 'replace'
  ) {
    throw new Error(
      `Expected "${fileName}" to declare serviceDiscovery as false, "merge", "new", or "replace".`,
    );
  }
  // Only merge modules can inherit the schema supplied by a lower-precedence source.
  if (definition.serviceDiscovery !== 'merge' && !definition.document) {
    throw new Error(
      `Expected "${fileName}" to provide a schema unless serviceDiscovery is "merge".`,
    );
  }
  return definition as ServiceMockDefinition;
}

/**
 * Loads one `<name>.mock.ts` service module.
 *
 * @param dir - Directory containing the module.
 * @param fileName - Mock module filename.
 * @returns The module's validated default service definition.
 */
async function loadServiceDefinition(
  dir: string,
  fileName: string,
): Promise<ServiceMockDefinition> {
  const extension = extname(fileName);
  const basename = fileName.slice(0, -extension.length);
  const { config } = await importConfig(basename, {
    baseDir: dir,
    extensions: [extension],
  });
  return assertServiceDefinition(config, fileName);
}

/**
 * Scans `dir` for executable `<name>.mock.ts` service modules and emitted
 * `.mock.js`/`.mock.mjs` equivalents. Each module must default-export a complete
 * definition created with `defineService({...})`.
 *
 * @remarks
 * Not recursive: every spec is expected directly inside `dir`, matching the
 * flat `mocks/` folder convention already used for dev-server mocking. To
 * layer several sources (e.g. a shared baseline under an app's own specs),
 * call this once per directory and combine the results with
 * `mergeServiceDefinitions`, or add each source via `MockServerHandle.use()`.
 *
 * @param dir - Directory to scan.
 * @returns One {@link ServiceMockDefinition} per discovered mock module.
 * @throws {Error} If a module is invalid or two modules declare the same service key.
 *
 * @example
 * ```typescript
 * // mocks/context.mock.ts, mocks/people.mock.ts
 * const definitions = await discoverServices('./mocks');
 * // definitions -> [{ key: 'context', document, ... }, { key: 'people', document, ... }]
 * ```
 */
export async function discoverServices(dir: string): Promise<ServiceMockDefinition[]> {
  const files = await readdir(dir);
  const moduleFiles = files
    // Ignore schemas and unrelated files because only executable mock modules define services.
    .filter((fileName) => MOCK_MODULE_PATTERN.test(fileName))
    .sort();
  const definitions = await Promise.all(
    moduleFiles
      // Module loading stays parallel while sorted filenames keep the returned order deterministic.
      .map((fileName) => loadServiceDefinition(dir, fileName)),
  );
  const keys = new Set<string>();
  // Duplicate keys would otherwise make precedence depend on filenames rather than explicit layers.
  for (const definition of definitions) {
    // Reject ambiguity within one source directory before definitions reach the merge layer.
    if (keys.has(definition.key)) {
      throw new Error(`Duplicate mock service key "${definition.key}" found in "${dir}".`);
    }
    keys.add(definition.key);
  }
  return definitions;
}

export default discoverServices;
