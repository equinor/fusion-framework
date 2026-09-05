import { readFileSync } from 'node:fs';

import type { OpenApiDocument } from '../../../../scripts/check-open-api-contract.ts';
import {
  OPENAPI_SERVICES,
  type OpenApiVersionConfig,
} from '../../../../scripts/openapi-services.ts';

/** HTTP methods an OpenAPI path item may publish, mirroring the OpenAPI specification. */
const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

/** Registry entry the `check:openapi apps` invocation resolves to. */
export const APPS_SERVICE = OPENAPI_SERVICES.find(
  (service) => service.name === 'apps',
) as (typeof OPENAPI_SERVICES)[number];

/** Apps API 1.0 configuration: snapshot path, remote URL, and the version it is pinned to. */
export const APPS_V1: OpenApiVersionConfig = APPS_SERVICE.versions[0];

/**
 * The checked-in Fusion Apps snapshot, parsed from the same file the drift check reads.
 *
 * Parsing the file directly keeps the suite offline and gives the contract one source of truth:
 * `pnpm check:openapi apps` proves the snapshot matches the live service, and these tests prove
 * the package implements the snapshot.
 */
export const APPS_OPENAPI_SNAPSHOT: OpenApiDocument = JSON.parse(
  readFileSync(new URL(`../../../../${APPS_V1.snapshotPath}`, import.meta.url), 'utf8'),
) as OpenApiDocument;

/**
 * Every operation the snapshot publishes, as `"<METHOD> <path>"`.
 *
 * @param document - Document to list, defaulting to the checked-in snapshot.
 * @returns The operation keys, sorted so a failure lists them in a stable order.
 *
 * @example
 * ```ts
 * expect(listOperations()).toHaveLength(108);
 * ```
 */
export const listOperations = (document: OpenApiDocument = APPS_OPENAPI_SNAPSHOT): string[] => {
  const entries = Object.entries(document.paths).flatMap(([path, item]) =>
    // A path item also holds non-operation keys such as `parameters` and `summary`.
    METHODS.filter((method) => item[method] !== undefined).map(
      (method) => `${method.toUpperCase()} ${path}`,
    ),
  );
  return entries.sort();
};

/** Every operation published by the checked-in snapshot, used by the coverage test. */
export const APPS_OPENAPI_OPERATIONS: readonly string[] = listOperations();
