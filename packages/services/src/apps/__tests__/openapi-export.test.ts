import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import appsV1OpenApi from '@equinor/fusion-services/apps/v1/openapi.json' with { type: 'json' };

import type { JsonValue, OpenApiDocument } from '../../../scripts/check-open-api-contract.ts';

/** HTTP methods an OpenAPI path item may publish as operations. */
const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

/** Recursively sorts object keys while preserving meaningful array order. */
const sortKeys = (value: JsonValue): JsonValue => {
  // Arrays keep their contract-defined order while their nested objects are normalized.
  if (Array.isArray(value)) return value.map(sortKeys);
  // Primitives and null have no keys to normalize.
  if (value === null || typeof value !== 'object') return value;
  // Rebuilding objects in sorted key order makes snapshot serialization deterministic.
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])]),
  );
};

/** The imported Apps contract, viewed through the drift checker's structural OpenAPI type. */
const document = JSON.parse(JSON.stringify(appsV1OpenApi)) as OpenApiDocument;

/** The package manifest imported as data so tests verify its public export metadata. */
const manifest = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as {
  name: string;
  files: string[];
  exports: Record<string, unknown>;
  typesVersions: Record<string, Record<string, string[]>>;
};

describe('Apps package exports', () => {
  it('publishes the endpoint client on its own service subpath', () => {
    expect(manifest.exports['./apps']).toEqual({
      import: './dist/esm/apps/index.js',
      types: './dist/types/apps/index.d.ts',
    });
    expect(manifest.typesVersions['*'].apps).toEqual(['./dist/types/apps/index.d.ts']);
    expect(`${manifest.name}/apps`).toBe('@equinor/fusion-services/apps');
  });

  it('keeps the package root free of an aggregated service namespace', () => {
    // A root export would drag every service schema graph into a consumer's bundle.
    expect(manifest.exports['.']).toBeUndefined();
  });

  it('publishes the version-scoped snapshot in the package tarball', () => {
    const target = manifest.exports['./apps/v1/openapi.json'];

    expect(target).toBe('./src/apps/v1/openapi.json');
    expect(manifest.files).toContain('src/apps/v1/openapi.json');
    expect(`${manifest.name}/apps/v1/openapi.json`).toBe(
      '@equinor/fusion-services/apps/v1/openapi.json',
    );
  });
});

describe('Apps OpenAPI snapshot export', () => {
  it('stores the complete Apps API contract deterministically', () => {
    // Each path may publish several operations alongside non-operation metadata.
    const operations = Object.values(document.paths).flatMap((item) =>
      METHODS.filter((method) => item[method] !== undefined),
    );

    expect(document.openapi).toBe('3.1.1');
    expect(document.info.version).toBe('1.0');
    expect(document.servers).toEqual([{ url: 'https://apps.ci.api.fusion-dev.net/' }]);
    expect(operations).toHaveLength(108);
    expect(Object.keys(document.components?.schemas ?? {})).toHaveLength(124);
    expect(document.components?.securitySchemes).toBeDefined();
    expect(document.security).toBeDefined();
    expect(document.tags).toBeDefined();
    expect(JSON.stringify(sortKeys(document))).toBe(JSON.stringify(document));
  });
});
