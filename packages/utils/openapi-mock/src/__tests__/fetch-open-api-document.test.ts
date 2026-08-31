import { describe, expect, it, vi } from 'vitest';

import { fetchOpenApiDocument } from '../lib/fetch-open-api-document.js';

const jsonResponse = (body: string, init: ResponseInit = {}) =>
  new Response(body, { status: 200, ...init });

describe('fetchOpenApiDocument', () => {
  it('parses a JSON document', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse('{"openapi":"3.0.0"}'));

    const document = await fetchOpenApiDocument('https://example.com/openapi.json', {
      fetch: fetchMock,
    });

    expect(document).toEqual({ openapi: '3.0.0' });
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/openapi.json');
  });

  it('parses a YAML document', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse('openapi: 3.0.0\npaths:\n  /pets:\n    get:\n      operationId: listPets\n'),
      );

    const document = await fetchOpenApiDocument('https://example.com/openapi.yaml', {
      fetch: fetchMock,
    });

    expect(document).toEqual(
      expect.objectContaining({
        openapi: '3.0.0',
        paths: { '/pets': { get: { operationId: 'listPets' } } },
      }),
    );
  });

  it('throws when the response is not ok', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('not found', { status: 404, statusText: 'Not Found' }));

    await expect(
      fetchOpenApiDocument('https://example.com/missing.json', { fetch: fetchMock }),
    ).rejects.toThrow(/404/);
  });
});
