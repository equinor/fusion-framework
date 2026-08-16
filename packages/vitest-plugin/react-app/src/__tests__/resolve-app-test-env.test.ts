import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveAppTestEnv } from '../resolve-app-test-env.js';

describe('resolveAppTestEnv', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'fusion-vitest-plugin-react-app-'));
    await writeFile(
      join(dir, 'package.json'),
      JSON.stringify({ name: '@equinor/my-app', version: '1.2.3', description: 'a test app' }),
    );
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('falls back to a package-derived manifest and an empty config with no local files', async () => {
    const { manifest, config } = await resolveAppTestEnv({ entrypoint: dir });

    expect(manifest).toMatchObject({
      appKey: 'my-app',
      displayName: '@equinor/my-app',
      description: 'a test app',
      type: 'standalone',
    });
    expect(config).toEqual({ environment: {} });
  });

  it('merges a local app.manifest.ts and app.config.ts, same as ffc app build', async () => {
    await writeFile(
      join(dir, 'app.manifest.ts'),
      "export default { displayName: 'My Custom App' };",
    );
    await writeFile(
      join(dir, 'app.config.ts'),
      "export default { environment: {}, endpoints: { api: { url: 'https://example.com' } } };",
    );

    const { manifest, config } = await resolveAppTestEnv({ entrypoint: dir });

    expect(manifest).toMatchObject({ appKey: 'my-app', displayName: 'My Custom App' });
    expect(config).toEqual({
      environment: {},
      endpoints: { api: { url: 'https://example.com', scopes: [] } },
    });
  });

  it('applies an inline manifest/config function directly, same as a loaded file default export', async () => {
    const { manifest, config } = await resolveAppTestEnv({
      entrypoint: dir,
      manifest: () => ({ displayName: 'Inline App' }),
      config: () => ({
        environment: {},
        endpoints: { api: { url: 'https://inline.example.com' } },
      }),
    });

    expect(manifest).toMatchObject({ appKey: 'my-app', displayName: 'Inline App' });
    expect(config).toEqual({
      environment: {},
      endpoints: { api: { url: 'https://inline.example.com', scopes: [] } },
    });
  });

  it('propagates an error for an explicitly requested manifest file that does not exist', async () => {
    await expect(
      resolveAppTestEnv({ entrypoint: dir, manifest: 'does-not-exist.manifest.ts' }),
    ).rejects.toThrow();
  });

  it('propagates an error for an explicitly requested config file that does not exist', async () => {
    await expect(
      resolveAppTestEnv({ entrypoint: dir, config: 'does-not-exist.config.ts' }),
    ).rejects.toThrow();
  });
});
