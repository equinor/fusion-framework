import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AppManifest } from '@equinor/fusion-framework-module-app';
import { loadAppManifest } from './load-app-manifest.js';

let root: string;
const base: AppManifest = {
  appKey: 'sitemap-fixture',
  displayName: 'Sitemap fixture',
  description: '',
  type: 'standalone',
};

describe('manifest sitemap generation', () => {
  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'fusion-manifest-sitemap-'));
    await mkdir(path.join(root, 'src'));
    await writeFile(path.join(root, 'package.json'), '{"type":"module"}');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it.each(['build', 'serve'] as const)(
    'resolves a registry pointer during %s manifest generation',
    async (command) => {
      await writeFile(
        path.join(root, 'app.manifest.ts'),
        `export default () => ({ routes: 'src/routes.ts' });`,
      );
      await writeFile(
        path.join(root, 'src/routes.ts'),
        `import { index } from '@equinor/fusion-framework-react-router/routes';
       export default index('./index.tsx');`,
      );
      await writeFile(
        path.join(root, 'src/index.tsx'),
        `throw new Error('Page executed');
       export const handle = { route: { description: 'Home' } };
       export default () => <p>Home</p>;`,
      );
      const { manifest } = await loadAppManifest({ root, command, mode: 'production' }, { base });
      expect(manifest.routes).toEqual([['/', 'Home']]);
      expect(JSON.parse(JSON.stringify(manifest)).routes).toEqual([['/', 'Home']]);
    },
  );

  it('preserves already serialized routes in object manifests', async () => {
    await writeFile(
      path.join(root, 'app.manifest.ts'),
      `export default { routes: [['/', 'Manual']] };`,
    );
    const { manifest } = await loadAppManifest(
      { root, command: 'build', mode: 'production' },
      { base },
    );
    expect(manifest.routes).toEqual([['/', 'Manual']]);
  });

  it('resolves registry pointers in JSON manifests too', async () => {
    await writeFile(
      path.join(root, 'app.manifest.json'),
      JSON.stringify({ routes: 'src/routes.ts' }),
    );
    await writeFile(
      path.join(root, 'src/routes.ts'),
      `import { index } from '@equinor/fusion-framework-react-router/routes';
       export default index('./index.tsx');`,
    );
    await writeFile(path.join(root, 'src/index.tsx'), 'export default () => null;');
    const { manifest } = await loadAppManifest(
      { root, command: 'build', mode: 'production' },
      { base },
    );
    expect(manifest.appKey).toBe(base.appKey);
    expect(manifest.routes).toEqual([['/', '']]);
  });

  it('does not introduce routing into apps without a registry pointer', async () => {
    await writeFile(
      path.join(root, 'app.manifest.ts'),
      `export default { displayName: 'Unrouted' };`,
    );
    const { manifest } = await loadAppManifest(
      { root, command: 'build', mode: 'production' },
      { base },
    );
    expect(manifest.displayName).toBe('Unrouted');
    expect(manifest.routes).toBeUndefined();
  });

  it('surfaces registry errors instead of publishing a source filename', async () => {
    await writeFile(
      path.join(root, 'app.manifest.ts'),
      `export default { routes: 'src/missing.ts' };`,
    );
    await expect(
      loadAppManifest({ root, command: 'build', mode: 'production' }, { base }),
    ).rejects.toThrow();
  });
});
