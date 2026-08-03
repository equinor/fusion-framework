import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join } from 'node:path';

import { importConfig } from '@equinor/fusion-imports';
import { parse as parseYaml } from 'yaml';

import type { FieldFakerMap } from './types';

/** Options for {@link loadFakerMap}. */
export interface LoadFakerMapOptions {
  /** Base directory a relative `source` path is resolved against (default: `process.cwd()`). */
  baseDir?: string;
}

/**
 * Loads a {@link FieldFakerMap} sidecar file describing per-model faker
 * overrides, so a spec's own `openapi.json`/`.yaml` never has to be edited —
 * or even owned — just to steer how its models are faked.
 *
 * @remarks
 * `.json`, `.yml` and `.yaml` sidecars can only declare faker-path strings
 * (e.g. `{ "User.email": "internet.email" }`), since none of those formats
 * can hold a function. A `.ts`/`.js`/`.mjs` sidecar — resolved through
 * `@equinor/fusion-imports`' `importConfig`, the same "fusion import"
 * convention this monorepo already uses for runtime config loading — can
 * export real functions too, for a field a faker path can't express; its
 * `default` export is used as the map.
 *
 * @param source - Path to the sidecar file, or an already-built {@link FieldFakerMap} (returned as-is).
 * @param options - See {@link LoadFakerMapOptions}.
 * @returns The loaded field faker map.
 *
 * @example Loading a map built in code — no file needed
 * ```typescript
 * const fields = await loadFakerMap({ 'User.email': 'internet.email' });
 * ```
 *
 * @example Loading a `.ts` sidecar with a custom function
 * ```typescript
 * // fields.faker.ts
 * export default {
 *   'User.email': 'internet.email',
 *   'User.id': ({ path }) => `usr_${path.join('-')}`,
 * } satisfies FieldFakerMap;
 * ```
 * ```typescript
 * const fields = await loadFakerMap('./fields.faker.ts');
 * const mock = createOpenApiMock(openapi, { fields });
 * ```
 */
export async function loadFakerMap(
  source: string | FieldFakerMap,
  options: LoadFakerMapOptions = {},
): Promise<FieldFakerMap> {
  // Already-built maps need no filesystem or module resolution.
  if (typeof source !== 'string') return source;

  const extension = extname(source).toLowerCase();
  // YAML sidecars are parsed directly because they are data-only formats.
  if (extension === '.yml' || extension === '.yaml') {
    const path = isAbsolute(source) ? source : join(options.baseDir ?? process.cwd(), source);
    return parseYaml(await readFile(path, 'utf-8'));
  }

  // .json, .ts, .js, .mjs (or no extension) resolve through `importConfig`'s own
  // extension probing, so a sidecar can be authored in whichever of those formats
  // (real functions require .ts/.js/.mjs, since JSON can't hold one)
  const basename = source.replace(/\.(json|ts|mjs|js)$/i, '');
  const { config } = await importConfig<FieldFakerMap>(basename, { baseDir: options.baseDir });
  return config;
}

export default loadFakerMap;
