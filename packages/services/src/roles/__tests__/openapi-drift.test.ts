import { describe, expect, it } from 'vitest';

import {
  checkOpenApiContract,
  type OpenApiDocument,
} from '../../../scripts/check-open-api-contract.ts';

import {
  listOperations,
  ROLES_OPENAPI_SNAPSHOT,
  ROLES_SERVICE,
  ROLES_V1,
} from './fixtures/roles-openapi-snapshot';

/** Runs the Roles check against a document supplied from memory, keeping the suite offline. */
const check = (remote: (document: OpenApiDocument) => OpenApiDocument) =>
  checkOpenApiContract(ROLES_SERVICE, async () =>
    remote(JSON.parse(JSON.stringify(ROLES_OPENAPI_SNAPSHOT)) as OpenApiDocument),
  );

/** Recursively sorts object keys, mirroring the deterministic form the snapshot is stored in. */
const sortKeys = (value: unknown): unknown => {
  // Arrays keep their order; only their elements are normalized.
  if (Array.isArray(value)) return value.map(sortKeys);
  // Primitives and null have no keys to sort.
  if (value === null || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  // Rebuilding in sorted key order is what makes the serialization comparable.
  return Object.fromEntries(
    Object.keys(source)
      .sort()
      .map((key) => [key, sortKeys(source[key])]),
  );
};

describe('Roles V2 registry entry', () => {
  it('pins the checked API version to the snapshot the endpoints are built from', () => {
    expect(ROLES_SERVICE.versions).toHaveLength(1);
    expect(ROLES_V1).toMatchObject({
      key: 'v1',
      apiVersion: '1.0',
      snapshotPath: 'src/roles/v1/openapi.json',
      sourceDirs: ['src/roles/endpoints', 'src/roles/v1/schemas'],
    });
    expect(ROLES_V1.url).toMatch(/^https:\/\//);
  });
});

describe('checked-in Roles V2 snapshot', () => {
  it('is stored in the deterministic form the check compares against', () => {
    expect(JSON.stringify(sortKeys(ROLES_OPENAPI_SNAPSHOT))).toBe(
      JSON.stringify(ROLES_OPENAPI_SNAPSHOT),
    );
  });

  it('keeps the complete published contract on disk', () => {
    expect(ROLES_OPENAPI_SNAPSHOT.info.version).toBe(ROLES_V1.apiVersion);
    expect(ROLES_OPENAPI_SNAPSHOT.servers).toBeDefined();
    expect(ROLES_OPENAPI_SNAPSHOT.components?.securitySchemes).toBeDefined();
    expect(Object.keys(ROLES_OPENAPI_SNAPSHOT.components?.schemas ?? {})).toHaveLength(118);
  });

  it('publishes the 73 operations this package implements', () => {
    expect(listOperations()).toHaveLength(73);
  });
});

describe('checkOpenApiContract for the Roles service', () => {
  it('exits 0 and reports the contract size when the remote matches the snapshot', async () => {
    const report = await check((document) => document);

    expect(report.exitCode).toBe(0);
    expect(report.results).toEqual([
      expect.objectContaining({ version: 'v1', drifted: false, operations: 73, schemas: 118 }),
    ]);
    expect(report.output).toContain('Fusion Roles V2 API 1.0 (v1) is in sync');
    expect(report.output).toContain('73 operations, 118 component schemas');
  });

  it('exits 1, names the drift, and points at the modules to update', async () => {
    const report = await check((document) => {
      document.paths['/roles'].delete = { summary: 'Delete all roles' };
      return document;
    });

    expect(report.exitCode).toBe(1);
    expect(report.results[0]?.diff.operations.added).toEqual(['DELETE /roles']);
    expect(report.output).toContain('has drifted from src/roles/v1/openapi.json');
    expect(report.output).toContain('+ added   DELETE /roles');
    expect(report.output).toContain('src/roles/endpoints and src/roles/v1/schemas');
  });

  it('fails instead of reporting drift when the remote publishes another API version', async () => {
    const failing = check((document) => ({
      ...document,
      info: { ...document.info, version: '2.0' },
    }));

    await expect(failing).rejects.toThrowError(/publishes API version 2\.0, not 1\.0/);
  });
});
