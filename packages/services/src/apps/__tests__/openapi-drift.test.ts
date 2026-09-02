import { describe, expect, it } from 'vitest';

import {
  checkOpenApiContract,
  type OpenApiDocument,
} from '../../../scripts/check-open-api-contract.ts';

import {
  APPS_OPENAPI_SNAPSHOT,
  APPS_SERVICE,
  APPS_V1,
  listOperations,
} from './fixtures/apps-openapi-snapshot';

/** Runs the Apps check against a document supplied from memory, keeping the suite offline. */
const check = (remote: (document: OpenApiDocument) => OpenApiDocument) =>
  checkOpenApiContract(APPS_SERVICE, async () =>
    remote(JSON.parse(JSON.stringify(APPS_OPENAPI_SNAPSHOT)) as OpenApiDocument),
  );

describe('Fusion Apps registry entry', () => {
  it('pins the checked API version to the snapshot the endpoints are built from', () => {
    expect(APPS_SERVICE.versions).toHaveLength(1);
    expect(APPS_V1).toMatchObject({
      key: 'v1',
      apiVersion: '1.0',
      snapshotPath: 'src/apps/v1/openapi.json',
      sourceDirs: ['src/apps/endpoints', 'src/apps/v1/schemas'],
    });
    expect(APPS_V1.url).toMatch(/^https:\/\//);
  });
});

describe('checkOpenApiContract for the Apps service', () => {
  it('exits 0 and reports the contract size when the remote matches the snapshot', async () => {
    const report = await check((document) => document);

    expect(report.exitCode).toBe(0);
    expect(report.results).toEqual([
      expect.objectContaining({ version: 'v1', drifted: false, operations: 108, schemas: 124 }),
    ]);
    expect(report.output).toContain('Fusion Apps API 1.0 (v1) is in sync');
    expect(report.output).toContain('108 operations, 124 component schemas');
  });

  it('exits 1, names the drift, and points at the modules to update', async () => {
    const report = await check((document) => {
      document.paths['/apps'].delete = { summary: 'Delete all apps' };
      return document;
    });

    expect(report.exitCode).toBe(1);
    expect(report.results[0]?.diff.operations.added).toEqual(['DELETE /apps']);
    expect(report.output).toContain('has drifted from src/apps/v1/openapi.json');
    expect(report.output).toContain('+ added   DELETE /apps');
    expect(report.output).toContain('src/apps/endpoints and src/apps/v1/schemas');
  });

  it('fails instead of reporting drift when the remote publishes another API version', async () => {
    const failing = check((document) => ({
      ...document,
      info: { ...document.info, version: '2.0' },
    }));

    await expect(failing).rejects.toThrowError(/publishes API version 2\.0, not 1\.0/);
  });
});

describe('checked-in Fusion Apps snapshot', () => {
  it('keeps the complete published contract on disk', () => {
    expect(APPS_OPENAPI_SNAPSHOT.info.version).toBe(APPS_V1.apiVersion);
    expect(APPS_OPENAPI_SNAPSHOT.servers).toBeDefined();
    expect(APPS_OPENAPI_SNAPSHOT.components?.securitySchemes).toBeDefined();
    expect(Object.keys(APPS_OPENAPI_SNAPSHOT.components?.schemas ?? {})).toHaveLength(124);
  });

  it('publishes the 108 operations this package implements', () => {
    expect(listOperations()).toHaveLength(108);
  });
});
