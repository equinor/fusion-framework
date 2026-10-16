import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolvePackage } from '../../lib/utils/resolve-package.js';
import { resolveAppManifest } from './resolve-app-manifest.js';
import { ConsoleLogger } from '../utils/ConsoleLogger.js';

let root: string;

/** Exercises the CLI entry point with a real package and manifest configuration. */
async function manifest(): ReturnType<typeof resolveAppManifest> {
  const pkg = await resolvePackage({ cwd: root });
  return resolveAppManifest({ root, command: 'build', mode: 'production' }, pkg);
}

describe('CLI default DSL sitemap', () => {
  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'fusion-cli-default-routes-'));
    await mkdir(path.join(root, 'src'));
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({ name: 'sitemap-app', version: '1.0.0', type: 'module' }),
    );
    await writeFile(path.join(root, 'app.manifest.ts'), 'export default {};');
    await writeFile(
      path.join(root, 'src/routes.ts'),
      `import { index } from '@equinor/fusion-framework-react-router/routes';
       throw new Error('Registry must not execute');
       export default index('./index.tsx');`,
    );
    await writeFile(
      path.join(root, 'src/index.tsx'),
      `throw new Error('Page must not execute');
       export const handle = { route: { description: 'Home' } };
       export default () => <p>Home</p>;`,
    );
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('uses src/routes.ts when the manifest omits routes', async () => {
    expect((await manifest()).routes).toEqual([['/', 'Home']]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('uses src/routes.ts when there is no manifest config', async () => {
    await rm(path.join(root, 'app.manifest.ts'));
    expect((await manifest()).routes).toEqual([['/', 'Home']]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it.each(['[]', 'null', "[['manual', 'Manual']]"])(
    'preserves explicit routes %s without inspecting the default registry',
    async (routes) => {
      await writeFile(path.join(root, 'app.manifest.ts'), `export default { routes: ${routes} };`);
      await writeFile(path.join(root, 'src/routes.ts'), 'invalid TypeScript !');
      expect((await manifest()).routes).toEqual(
        routes === 'null' ? null : routes === '[]' ? [] : [['manual', 'Manual']],
      );
      expect(console.warn).not.toHaveBeenCalled();
    },
  );

  it('prefers an explicit registry pointer to the conventional path', async () => {
    await writeFile(
      path.join(root, 'app.manifest.ts'),
      `export default { routes: 'src/custom.ts' };`,
    );
    await writeFile(
      path.join(root, 'src/custom.ts'),
      `import { index } from '@equinor/fusion-framework-react-router/routes';
       export default index('./index.tsx', { description: 'Custom' });`,
    );
    await writeFile(path.join(root, 'src/routes.ts'), 'invalid TypeScript !');
    expect((await manifest()).routes).toEqual([['/', 'Custom']]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'warns with documentation and continues without a registry (manifest config: %s)',
    async (hasConfig) => {
      // Both configured apps and package-only apps need the same migration guidance.
      if (!hasConfig) await rm(path.join(root, 'app.manifest.ts'));
      await rm(path.join(root, 'src/routes.ts'));
      expect((await manifest()).routes).toBeUndefined();
      expect(console.warn).toHaveBeenCalledExactlyOnceWith(
        expect.stringMatching(
          /Missing DSL routing:.*src\/routes\.ts.*Read more: https:\/\/equinor\.github\.io\/fusion-framework\/modules\/react\/router\/route-sitemap\.html/,
        ),
      );
    },
  );

  it('uses the CLI logger when supplied', async () => {
    await rm(path.join(root, 'src/routes.ts'));
    vi.spyOn(ConsoleLogger.prototype, 'start').mockImplementation(() => {});
    vi.spyOn(ConsoleLogger.prototype, 'succeed').mockImplementation(() => {});
    const warn = vi.spyOn(ConsoleLogger.prototype, 'warn').mockImplementation(() => {});
    await resolveAppManifest(
      { root, command: 'build', mode: 'production' },
      await resolvePackage({ cwd: root }),
      { log: new ConsoleLogger('Test') },
    );
    expect(warn).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('Missing DSL routing'));
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('fails instead of warning for an invalid default registry', async () => {
    await writeFile(path.join(root, 'src/routes.ts'), 'export default computeRoutes();');
    await expect(manifest()).rejects.toThrow('CallExpression');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('fails instead of warning for a missing referenced page', async () => {
    await rm(path.join(root, 'src/index.tsx'));
    await expect(manifest()).rejects.toThrow('index.tsx');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not fall back when an explicitly configured registry is missing', async () => {
    await writeFile(
      path.join(root, 'app.manifest.ts'),
      `export default { routes: 'src/missing.ts' };`,
    );
    await expect(manifest()).rejects.toThrow('missing.ts');
    expect(console.warn).not.toHaveBeenCalled();
  });
});
