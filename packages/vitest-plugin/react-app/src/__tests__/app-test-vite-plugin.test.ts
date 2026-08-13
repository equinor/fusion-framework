import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { appTestVitePlugin } from '../index.js';

type ResolveIdHook = (id: string) => string | null | undefined;
type LoadHook = (id: string) => string | null | undefined | Promise<string | null | undefined>;

describe('appTestVitePlugin', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'fusion-vitest-plugin-react-app-'));
    await writeFile(
      join(dir, 'package.json'),
      JSON.stringify({ name: '@equinor/my-app', version: '1.2.3' }),
    );
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('claims only its two virtual specifiers, leaving everything else unresolved', () => {
    const plugin = appTestVitePlugin({ entrypoint: dir });
    const resolveId = plugin.resolveId as ResolveIdHook;

    expect(resolveId('virtual:fusion-app-test-env')).toBe('\0virtual:fusion-app-test-env');
    expect(resolveId('virtual:fusion-app-test-configure')).toBe(
      '\0virtual:fusion-app-test-configure',
    );
    expect(resolveId('some-other-module')).toBeNull();
  });

  it('serves the resolved manifest/config as the env virtual module', async () => {
    const plugin = appTestVitePlugin({ entrypoint: dir });
    const load = plugin.load as LoadHook;

    const source = await load('\0virtual:fusion-app-test-env');

    expect(source).toContain('"appKey":"my-app"');
    expect(source).toContain('export const config = {"environment":{}};');
  });

  it('serves an undefined configure export when no config file exists', async () => {
    const plugin = appTestVitePlugin({ entrypoint: dir });
    const load = plugin.load as LoadHook;

    const source = await load('\0virtual:fusion-app-test-configure');

    expect(source).toBe('export const configure = undefined;');
  });

  it('re-exports the default candidate config file as the configure virtual module', async () => {
    await mkdir(join(dir, 'src'), { recursive: true });
    await writeFile(join(dir, 'src', 'config.ts'), 'export default () => undefined;');
    const plugin = appTestVitePlugin({ entrypoint: dir });
    const load = plugin.load as LoadHook;

    const source = await load('\0virtual:fusion-app-test-configure');

    expect(source).toBe(
      `export { default as configure } from ${JSON.stringify(join(dir, 'src', 'config.ts'))};`,
    );
  });

  it('re-exports an explicitly requested configure file', async () => {
    await writeFile(join(dir, 'my-config.ts'), 'export default () => undefined;');
    const plugin = appTestVitePlugin({ entrypoint: dir, configure: 'my-config.ts' });
    const load = plugin.load as LoadHook;

    const source = await load('\0virtual:fusion-app-test-configure');

    expect(source).toBe(
      `export { default as configure } from ${JSON.stringify(join(dir, 'my-config.ts'))};`,
    );
  });

  it('throws when an explicitly requested configure file does not exist', () => {
    expect(() => appTestVitePlugin({ entrypoint: dir, configure: 'missing.ts' })).toThrow();
  });

  it('returns null for module ids other than its own virtual specifiers', async () => {
    const plugin = appTestVitePlugin({ entrypoint: dir });
    const load = plugin.load as LoadHook;

    expect(await load('some-other-module')).toBeNull();
  });
});
