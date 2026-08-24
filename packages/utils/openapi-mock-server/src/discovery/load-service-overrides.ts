import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join } from 'node:path';

import { importConfig } from '@equinor/fusion-imports';
import { parse as parseYaml } from 'yaml';

import type { FieldFakerValue } from '@equinor/fusion-openapi-mock';
import type { Router } from './create-router.js';
import type { MockOverride } from '../server/types.js';
import type { OpenApiMockOverride } from '@equinor/fusion-openapi-mock';

/**
 * One `paths[path][method]` entry of a `<key>.overrides.*` sidecar: either a static
 * `{ status?, mock }` response, or a full {@link OpenApiMockOverride} handler
 * (only from a `.ts`/`.js`/`.mjs` sidecar, since a function can't survive JSON/YAML).
 */
export type RouteOverride = MockOverride | OpenApiMockOverride;

/**
 * A `<key>.overrides.*` sidecar's contents — deliberately mirroring the OpenAPI document's
 * own `paths`/`components` shape, so overriding a route or a model's field reads the
 * same way the spec itself declares it.
 */
export interface ServiceOverrides {
  /** Response overrides, keyed exactly like the OpenAPI document's own `paths`: by path, then HTTP method. */
  paths?: Record<string, Record<string, RouteOverride>>;
  /** Field-faker overrides, keyed by model name, then field name — mirroring `components.schemas`. */
  components?: Record<string, Record<string, FieldFakerValue>>;
  /** Registers routes checked ahead of this service's generated mock responses. Only a `.ts`/`.js`/`.mjs` sidecar can declare this, since a function can't survive JSON/YAML. */
  middleware?: (router: Router) => void;
}

/** Options for {@link loadServiceOverrides}. */
export interface LoadServiceOverridesOptions {
  /** Base directory a relative `source` path is resolved against (default: `process.cwd()`). */
  baseDir?: string;
}

/** Rejects anything that doesn't parse to `{ paths?, components? }`. */
function assertServiceOverrides(value: unknown, path: string): ServiceOverrides {
  // A bare scalar or array can never be a valid `{ paths?, components? }` sidecar.
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(
      `Expected ${path} to parse to a plain object with "paths" and/or "components" properties.`,
    );
  }
  return value as ServiceOverrides;
}

/**
 * Loads a `<key>.overrides.*` sidecar — one file per service, mirroring the OpenAPI
 * document's own shape: `paths` overrides a route's response by path and method, and
 * `components` overrides a model's faked fields, the same way the spec itself declares both.
 *
 * @remarks
 * `.json`, `.yml` and `.yaml` sidecars can only declare static `paths` responses and
 * faker-path strings under `components` — neither format can hold a function. A
 * `.ts`/`.js`/`.mjs` sidecar — resolved through `@equinor/fusion-imports`' `importConfig` —
 * can use a real function for either, for cases a static value or faker path can't express;
 * its `default` export is used as the {@link ServiceOverrides}.
 *
 * @param source - Path to the sidecar file, or an already-built {@link ServiceOverrides} (returned as-is).
 * @param options - See {@link LoadServiceOverridesOptions}.
 * @returns The loaded service overrides.
 *
 * @example
 * ```typescript
 * // people.overrides.ts
 * export default {
 *   paths: {
 *     '/persons/{id}': {
 *       get: { mock: { name: 'Turanga Leela' } },
 *     },
 *   },
 *   components: {
 *     Person: { mail: 'internet.email' },
 *   },
 * } satisfies ServiceOverrides;
 * ```
 */
export async function loadServiceOverrides(
  source: string | ServiceOverrides,
  options: LoadServiceOverridesOptions = {},
): Promise<ServiceOverrides> {
  // Already-built overrides need no filesystem or module resolution.
  if (typeof source !== 'string') return source;

  const extension = extname(source).toLowerCase();
  // YAML sidecars are parsed directly because they are data-only formats.
  if (extension === '.yml' || extension === '.yaml') {
    const path = isAbsolute(source) ? source : join(options.baseDir ?? process.cwd(), source);
    const parsed: unknown = parseYaml(await readFile(path, 'utf-8'));
    return assertServiceOverrides(parsed, path);
  }

  // .json, .ts, .js, .mjs (or no extension) resolve through `importConfig`'s own extension probing.
  const basename = source.replace(/\.(json|ts|mjs|js)$/i, '');
  const { config, path } = await importConfig<ServiceOverrides>(basename, {
    baseDir: options.baseDir,
  });
  return assertServiceOverrides(config, path);
}

export default loadServiceOverrides;
