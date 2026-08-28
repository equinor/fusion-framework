import { describe, expect, it } from 'vitest';

import {
  checkOpenApiContract,
  type OpenApiDocument,
  type OpenApiCheckReport,
} from '../../scripts/check-open-api-contract.ts';

import { SYNTHETIC_SERVICE, syntheticDocument } from './fixtures/synthetic-openapi-service';

/**
 * Runs the check against a document supplied from memory, so the suite never touches the network.
 *
 * The baseline is always the fixture snapshot on disk, which is what the checker reads.
 */
const check = (remote: (document: OpenApiDocument) => unknown): Promise<OpenApiCheckReport> =>
  checkOpenApiContract(SYNTHETIC_SERVICE, async () => remote(syntheticDocument()));

describe('checkOpenApiContract when the contract matches', () => {
  it('exits 0 and reports the operation and schema counts', async () => {
    const report = await check((document) => document);

    expect(report.exitCode).toBe(0);
    expect(report.results).toEqual([
      expect.objectContaining({ version: 'v1', drifted: false, operations: 3, schemas: 2 }),
    ]);
    expect(report.output).toContain('is in sync');
    expect(report.output).toContain('3 operations, 2 component schemas');
  });

  it('normalizes both documents, so reordered object keys are not drift', async () => {
    const report = await check((document) => ({
      components: document.components,
      info: { version: '1.0', title: 'Fixture API' },
      openapi: document.openapi,
      paths: document.paths,
      security: document.security,
      servers: document.servers,
      tags: document.tags,
    }));

    expect(report.exitCode).toBe(0);
    expect(report.output).toContain('is in sync');
  });
});

describe('checkOpenApiContract when the contract drifted', () => {
  it('reports added, removed, and changed operations and exits 1', async () => {
    const report = await check((document) => {
      document.paths['/roles'].delete = { summary: 'Delete all roles' };
      delete document.paths['/roles/{roleIdentifier}'].get;
      document.paths['/roles'].get = { summary: 'List roles, paged' };
      return document;
    });

    expect(report.exitCode).toBe(1);
    expect(report.results[0]?.diff.operations).toEqual({
      added: ['DELETE /roles'],
      removed: ['GET /roles/{roleIdentifier}'],
      changed: ['GET /roles'],
    });
    expect(report.output).toContain('Operations:');
    expect(report.output).toContain('+ added   DELETE /roles');
    expect(report.output).toContain('- removed GET /roles/{roleIdentifier}');
    expect(report.output).toContain('~ changed GET /roles');
  });

  it('detects a change inside an operation body, not only its method and path', async () => {
    const report = await check((document) => {
      document.paths['/roles'].post = {
        summary: 'Create role',
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'created' } },
      };
      return document;
    });

    expect(report.results[0]?.diff.operations.changed).toEqual(['POST /roles']);
    expect(report.results[0]?.diff.operations.added).toEqual([]);
  });

  it('reports added, removed, and changed component schemas', async () => {
    const report = await check((document) => {
      const schemas = document.components?.schemas ?? {};
      schemas.ApiSystem = { type: 'object' };
      delete schemas.ApiScopeType;
      schemas.ApiRole = { type: 'object', properties: { id: { type: 'string' }, name: {} } };
      return document;
    });

    expect(report.results[0]?.diff.schemas).toEqual({
      added: ['ApiSystem'],
      removed: ['ApiScopeType'],
      changed: ['ApiRole'],
    });
    expect(report.output).toContain('Component schemas:');
    expect(report.output).toContain('- removed ApiScopeType');
  });

  it('reports other contract fields, including the API metadata and servers', async () => {
    const report = await check((document) => {
      document.info = { title: 'Fixture API', version: '1.0', description: 'now documented' };
      document.security = [{ oauth2: ['scope'] }];
      // `servers` is never stripped, so an environment change is drift like any other.
      document.servers = [{ url: 'https://other.test/' }];
      return document;
    });

    expect(report.results[0]?.diff.fields.changed).toEqual(['info', 'security', 'servers']);
    expect(report.output).toContain('Contract fields:');
    expect(report.output).toContain('~ changed info');
  });

  it('reports path-item metadata changes separately from operation changes', async () => {
    const report = await check((document) => {
      document.paths['/roles']['x-contract-source'] = 'generated';
      return document;
    });

    expect(report.results[0]?.diff.fields.added).toEqual(['paths./roles.x-contract-source']);
    expect(report.results[0]?.diff.operations).toEqual({ added: [], removed: [], changed: [] });
  });

  it('reports a changed security scheme without flagging every schema', async () => {
    const report = await check((document) => {
      // biome-ignore lint/style/noNonNullAssertion: the fixture always defines components
      document.components!.securitySchemes = { oauth2: { type: 'openIdConnect' } };
      return document;
    });

    expect(report.results[0]?.diff.fields.changed).toEqual(['components.securitySchemes']);
    expect(report.results[0]?.diff.schemas.changed).toEqual([]);
  });

  it('explains manual snapshot adoption and leaves the snapshot untouched', async () => {
    const before = JSON.stringify(syntheticDocument());

    const report = await check((document) => {
      document.paths['/roles'].delete = { summary: 'Delete all roles' };
      return document;
    });

    expect(report.output).toContain('The snapshot was left untouched.');
    expect(report.output).toContain('src/__tests__/fixtures/synthetic-openapi.json manually');
    expect(report.output).toContain('src/synthetic/endpoints');
    expect(JSON.stringify(syntheticDocument())).toBe(before);
  });
});

describe('checkOpenApiContract when the check cannot run', () => {
  it.each([
    ['a non-object body', 'not a document', /did not return an OpenAPI document object/],
    ['an array body', [], /did not return an OpenAPI document object/],
    ['a null body', null, /did not return an OpenAPI document object/],
    ['a body without "openapi"', { info: { version: '1.0' }, paths: { '/x': {} } }, /"openapi"/],
    ['a body without "info.version"', { openapi: '3.1.1', paths: { '/x': {} } }, /"info.version"/],
    ['a body with no paths', { openapi: '3.1.1', info: { version: '1.0' }, paths: {} }, /"paths"/],
  ])('rejects %s rather than reporting drift', async (_case, body, expected) => {
    await expect(check(() => body)).rejects.toThrowError(expected);
  });

  it('rejects a document that publishes another API version', async () => {
    const failing = check((document) => ({ ...document, info: { title: 'x', version: '2.0' } }));

    await expect(failing).rejects.toThrowError(/publishes API version 2\.0, not 1\.0/);
  });

  it('surfaces the transport failure verbatim', async () => {
    const failing = check(() => {
      throw new Error('getaddrinfo ENOTFOUND example.test');
    });

    await expect(failing).rejects.toThrowError(/ENOTFOUND/);
  });
});
