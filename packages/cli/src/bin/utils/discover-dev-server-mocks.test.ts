import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { discoverDevServerMocks } from './discover-dev-server-mocks.js';

describe('discoverDevServerMocks', () => {
  it('derives local entries from visible service modules and skips direct-only services', async () => {
    const directory = fileURLToPath(new URL('./__tests__/fixtures/dev-mocks', import.meta.url));

    const mocks = await discoverDevServerMocks(directory, 4010);

    expect(mocks).toEqual([
      {
        key: 'foo',
        name: 'foo mock',
        uri: 'http://foo.localhost:4010',
        serviceDiscovery: 'replace',
      },
    ]);
  });

  it('returns no services when the configured directory does not exist', async () => {
    const directory = fileURLToPath(new URL('./__tests__/fixtures/missing', import.meta.url));

    await expect(discoverDevServerMocks(directory, 4010)).resolves.toEqual([]);
  });
});
