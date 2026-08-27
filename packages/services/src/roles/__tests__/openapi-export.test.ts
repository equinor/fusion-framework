import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import rolesV1OpenApi from '@equinor/fusion-services/roles/v1/openapi.json' with { type: 'json' };

import type { OpenApiDocument } from '../../../scripts/check-open-api-contract.ts';

import {
  listOperations,
  ROLES_OPENAPI_SNAPSHOT,
  ROLES_V1,
} from './fixtures/roles-openapi-snapshot';

/** The package manifest, read from disk so the assertions check the published metadata. */
const manifest = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as {
  name: string;
  files: string[];
  exports: Record<string, unknown>;
};

/** The imported document, typed through the tooling's structural view. */
const imported = rolesV1OpenApi as unknown as OpenApiDocument;

describe('OpenAPI snapshot export', () => {
  it('exposes only the version-scoped subpath, with no unversioned alias', () => {
    expect(manifest.exports).not.toHaveProperty('./roles/openapi.json');
  });

  it('is reachable through the documented public subpath', () => {
    // The registry, the manifest, and the documented specifier must name one and the same file.
    expect(`${manifest.name}/roles/v1/openapi.json`).toBe(
      '@equinor/fusion-services/roles/v1/openapi.json',
    );
    expect(manifest.exports['./roles/v1/openapi.json']).toBe(`./${ROLES_V1.snapshotPath}`);
  });

  it('points the export at a path the package tarball ships', () => {
    const target = manifest.exports['./roles/v1/openapi.json'] as string;
    // `files` entries are directory or file prefixes relative to the package root.
    const shipped = manifest.files.some((entry) => target.startsWith(`./${entry}`));
    expect(shipped, `${target} is not covered by "files": ${manifest.files.join(', ')}`).toBe(true);
  });

  it('imports as JSON through standard ESM import attributes', () => {
    expect(imported.openapi).toMatch(/^3\./);
    // The subpath is versioned by the API version it serves, not by the package version.
    expect(imported.info.version).toBe(ROLES_V1.apiVersion);
    expect(Object.keys(imported.paths).length).toBeGreaterThan(0);
  });

  it('serves the same bytes the drift tooling reads from disk', () => {
    expect(JSON.stringify(imported)).toBe(JSON.stringify(ROLES_OPENAPI_SNAPSHOT));
  });

  it('carries the complete contract, not a reduced fixture', () => {
    expect(imported.components?.schemas).toBeDefined();
    expect(imported.components?.securitySchemes).toBeDefined();
    expect(imported.security).toBeDefined();
    expect(imported.tags).toBeDefined();
    // `servers` is kept so the snapshot can drive a mock server unmodified.
    expect(imported.servers).toBeDefined();
  });

  it('publishes the 73 operations this package implements', () => {
    expect(listOperations(imported).length).toBe(73);
  });
});
