import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadMockServerConfig } from '../load-mock-server-config.js';

describe('loadMockServerConfig', () => {
  it('loads mock-server settings and upstream discovery from a config factory', async () => {
    const root = fileURLToPath(new URL('./fixtures/configured', import.meta.url));

    await expect(loadMockServerConfig(root)).resolves.toEqual({
      path: 'api-mocks',
      port: 4010,
      host: '127.0.0.1',
      seed: 42,
    });
  });

  it('returns no overrides when no dev-server config exists', async () => {
    const root = fileURLToPath(new URL('./fixtures', import.meta.url));

    await expect(loadMockServerConfig(root)).resolves.toEqual({});
  });
});
