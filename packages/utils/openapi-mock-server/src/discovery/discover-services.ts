import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { flattenSchemaOverrides } from './flatten-schema-overrides.js';
import { loadOpenApiDocument } from './load-open-api-document.js';
import { loadServiceOverrides } from './load-service-overrides.js';
import { createRouter } from './create-router.js';

import type { FieldFakerMap, OpenApiDocumentLike } from '@equinor/fusion-openapi-mock';
import type { Router } from './create-router.js';
import type { RouteOverride } from './load-service-overrides.js';

const SPEC_SUFFIXES = ['.openapi.json', '.openapi.yaml', '.openapi.yml'];
const OVERRIDES_SUFFIXES = [
  '.overrides.ts',
  '.overrides.js',
  '.overrides.mjs',
  '.overrides.json',
  '.overrides.yaml',
  '.overrides.yml',
];

/**
 * One service discovered on disk: its key, parsed spec, and optional field/route overrides.
 *
 * `document` is only omitted for a fields-only override — a lone `<key>.overrides.*` file
 * with no matching `<key>.openapi.*` spec in the same directory. `mergeServiceDefinitions`
 * merges such an entry's `fields`/`paths` onto an earlier-registered definition for the
 * same key (e.g. a bundled preset), instead of requiring the whole spec to be duplicated
 * just to override a few fields or routes.
 */
export interface ServiceMockDefinition {
  /** The mock server's routing key for this service, and its service-discovery `key`. */
  key: string;
  /** The parsed OpenAPI document, ready for `createOpenApiMock`. Omitted for a fields-only override. */
  document?: OpenApiDocumentLike;
  /** Field-faker overrides, flattened from a `<key>.overrides.*` sidecar's `components`, if one exists. */
  fields?: FieldFakerMap;
  /** Static, always-on route overrides from a `<key>.overrides.*` sidecar's `paths`, if one exists — keyed by path, then HTTP method, exactly like the OpenAPI document's own `paths`. */
  paths?: Record<string, Record<string, RouteOverride>>;
  /** A router checked ahead of this service's generated mock responses, built from a `<key>.overrides.*` sidecar's `middleware` export, if one exists. */
  router?: Router;
}

/** Matches `<service>.openapi.{json,yaml,yml}` and returns its service key, or `undefined`. */
function matchSpecFile(fileName: string): string | undefined {
  // Find the suffix (if any) that identifies this file as a spec.
  const suffix = SPEC_SUFFIXES.find((candidate) => fileName.endsWith(candidate));
  return suffix ? fileName.slice(0, -suffix.length) : undefined;
}

/** Matches `<service>.overrides.{ts,js,json,yaml,yml}` and returns its service key, or `undefined`. */
function matchOverridesFile(fileName: string): string | undefined {
  // Find the suffix (if any) that identifies this file as an overrides sidecar.
  const suffix = OVERRIDES_SUFFIXES.find((candidate) => fileName.endsWith(candidate));
  return suffix ? fileName.slice(0, -suffix.length) : undefined;
}

/** The first `<key>.overrides.*` sidecar present in `files`, if any. */
function findOverridesFile(key: string, files: string[]): string | undefined {
  return (
    OVERRIDES_SUFFIXES
      // Build every candidate sidecar filename for this key.
      .map((suffix) => `${key}${suffix}`)
      // Use the first one that's actually present on disk.
      .find((candidate) => files.includes(candidate))
  );
}

/** A definition's `fields`/`paths`, loaded from its `<key>.overrides.*` sidecar, if any. */
async function loadOverridesFor(
  dir: string,
  key: string,
  files: string[],
): Promise<{
  fields?: FieldFakerMap;
  paths?: Record<string, Record<string, RouteOverride>>;
  router?: Router;
}> {
  const overridesFile = findOverridesFile(key, files);
  // No sidecar for this key: nothing to load.
  if (!overridesFile) return {};
  const { components, paths, middleware } = await loadServiceOverrides(join(dir, overridesFile));
  let router: Router | undefined;
  // A middleware export needs its own Router built and registered against, unlike static paths/components.
  if (middleware) {
    router = createRouter();
    middleware(router);
  }
  return { fields: flattenSchemaOverrides(components), paths, router };
}

/**
 * Scans `dir` for `<service>.openapi.{json,yaml,yml}` spec files (plus an optional
 * `<service>.overrides.*` sidecar for field and route overrides), so a mock server can be
 * started from a plain folder of specs — no code needed to register each service by hand.
 *
 * A `<service>.overrides.*` file with no spec of its own in `dir` is returned as a
 * fields-only definition (no `document`) — see {@link ServiceMockDefinition} and
 * {@link mergeServiceDefinitions}. This lets an app override a handful of fields or routes
 * on a bundled preset's service without copying that preset's whole spec locally.
 *
 * @remarks
 * Not recursive: every spec is expected directly inside `dir`, matching the
 * flat `mocks/` folder convention already used for dev-server mocking. To
 * layer several sources (e.g. a shared baseline under an app's own specs),
 * call this once per directory and combine the results with
 * `mergeServiceDefinitions`, or add each source via `MockServerHandle.use()`.
 *
 * @param dir - Directory to scan.
 * @returns One {@link ServiceMockDefinition} per discovered spec or fields-only sidecar.
 * @throws {Error} If a spec file's contents cannot be parsed as JSON or YAML.
 *
 * @example
 * ```typescript
 * // mocks/context.openapi.json, mocks/context.overrides.ts, mocks/people.overrides.ts (fields-only)
 * const definitions = await discoverServices('./mocks');
 * // definitions -> [{ key: 'context', document, fields, paths }, { key: 'people', fields, paths }]
 * ```
 */
export async function discoverServices(dir: string): Promise<ServiceMockDefinition[]> {
  const files = await readdir(dir);

  const specDefinitions = await Promise.all(
    files
      // Only files following the `<service>.openapi.*` naming convention are specs.
      .map((fileName) => ({ fileName, key: matchSpecFile(fileName) }))
      // Drop entries that didn't match the naming convention.
      .filter((entry): entry is { fileName: string; key: string } => entry.key !== undefined)
      // Load each spec's document (and its optional overrides sidecar) in parallel.
      .map(async ({ fileName, key }) => {
        const document = await loadOpenApiDocument(join(dir, fileName));
        const { fields, paths, router } = await loadOverridesFor(dir, key, files);
        return { key, document, fields, paths, router };
      }),
  );

  // Keys already covered by a local spec, so a same-named sidecar isn't also treated as fields-only.
  const specKeys = new Set(specDefinitions.map((definition) => definition.key));

  // A `.overrides.*` file with no spec of its own is a fields-only override, merged by
  // `mergeServiceDefinitions` onto a definition supplied by another source (e.g. a preset).
  const fieldsOnlyKeys = new Set(
    files
      .map((fileName) => matchOverridesFile(fileName))
      .filter((key): key is string => key !== undefined && !specKeys.has(key)),
  );

  const fieldsOnlyDefinitions = await Promise.all(
    Array.from(fieldsOnlyKeys, async (key) => ({
      key,
      ...(await loadOverridesFor(dir, key, files)),
    })),
  );

  // Fields-only entries are resolved separately above; combine both so callers see one flat list.
  return [...specDefinitions, ...fieldsOnlyDefinitions];
}

export default discoverServices;
