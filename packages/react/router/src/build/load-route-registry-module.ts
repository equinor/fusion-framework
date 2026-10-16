import { createHash } from 'node:crypto';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { importScript } from '@equinor/fusion-imports';

/** Monotonic counter giving every registry evaluation a fresh module URL. */
let evaluationCount = 0;

/**
 * Evaluates an explicit route registry module and returns its route definition export.
 *
 * Only the registry module (and local modules it imports) is bundled and evaluated.
 * Route DSL helpers reference page modules by path string, so route components,
 * loaders and actions are never imported. Package imports stay external and are
 * resolved from the project's `node_modules`.
 *
 * Each call writes a uniquely named temporary bundle under
 * `<root>/node_modules/.cache/fusion-framework-react-router`, imports it and deletes it.
 * The unique name bypasses the ESM module cache so edits in development are picked up.
 *
 * @param root - Absolute project root.
 * @param file - Absolute registry module path.
 * @returns The `default` export, or the named `routes` export when there is no default.
 * @throws {Error} When the registry cannot be bundled or evaluated.
 */
export async function loadRouteRegistryModule(root: string, file: string): Promise<unknown> {
  const source = await readFile(file);
  const hash = createHash('sha256').update(file).update(source).digest('hex').slice(0, 12);
  const cacheDir = path.join(root, 'node_modules', '.cache', 'fusion-framework-react-router');
  const outfile = path.join(cacheDir, `routes.${hash}.${++evaluationCount}.mjs`);
  await mkdir(cacheDir, { recursive: true });
  try {
    const module = await importScript(file, { outfile, logLevel: 'silent' });
    return module.default ?? module.routes;
  } finally {
    // The evaluated module stays in memory; the bundle on disk is only a loading vehicle
    await rm(outfile, { force: true });
  }
}
