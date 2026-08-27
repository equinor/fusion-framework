import { readFileSync } from 'node:fs';

import type { OpenApiDocument } from '../../../scripts/check-open-api-contract.ts';
import type { OpenApiServiceConfig } from '../../../scripts/openapi-services.ts';

/** Package-relative path of the fixture snapshot, resolved the way the checker resolves it. */
const SNAPSHOT_PATH = 'src/__tests__/fixtures/synthetic-openapi.json';

/**
 * Registry entry pointing the checker at the fixture snapshot instead of a real service.
 *
 * Keeps the generic drift tests offline and independent of the Roles contract, while exercising
 * the same registry-driven code path the CLI uses.
 */
export const SYNTHETIC_SERVICE: OpenApiServiceConfig = {
  name: 'synthetic',
  label: 'Synthetic API',
  versions: [
    {
      key: 'v1',
      apiVersion: '1.0',
      url: 'https://example.test/openapi.json',
      snapshotPath: SNAPSHOT_PATH,
      sourceDirs: ['src/synthetic/endpoints'],
    },
  ],
};

/**
 * Fresh copy of the fixture snapshot, so a mutated document cannot alias another test's baseline.
 *
 * @returns The parsed fixture document.
 *
 * @example
 * ```ts
 * const remote = syntheticDocument();
 * remote.paths['/roles'].delete = { summary: 'Delete all roles' };
 * ```
 */
export const syntheticDocument = (): OpenApiDocument =>
  JSON.parse(
    readFileSync(new URL(`../../../${SNAPSHOT_PATH}`, import.meta.url), 'utf8'),
  ) as OpenApiDocument;
