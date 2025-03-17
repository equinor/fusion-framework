import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { dirname, extname, resolve } from 'node:path';

import type { Plugin as EsBuildPlugin } from 'esbuild';

import { vol } from 'memfs';

export const memfsPlugin: EsBuildPlugin = {
  name: 'memfs',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      // If it's the entry point, use the absolute path directly
      if (args.kind === 'entry-point') {
        return { path: args.path, namespace: 'memfs' };
      }

      // For imports, resolve relative to the importer's directory
      // Imports: resolve relative to importer's directory
      const importerDir = dirname(args.importer);
      let resolvedPath = resolve(importerDir, args.path);

      // Append .ts if no extension (match mockFiles)
      if (!extname(resolvedPath)) {
        resolvedPath += '.ts'; // Adjust to .js if needed
      }

      return { path: resolvedPath, namespace: 'memfs' };
    });
    build.onLoad({ filter: /.*/, namespace: 'memfs' }, async (args) => {
      const contents = String(vol.readFileSync(args.path, 'utf-8'));
      return { contents, loader: extname(args.path).slice(1) as 'js' | 'ts' };
    });
  },
};

beforeAll(() => {
  vi.mock('node:fs/promises', () => ({
    access: vol.promises.access,
    readFile: vol.promises.readFile,
    default: vol.promises,
  }));

  vi.mock('../src/import-script', async (importOriginal) => {
    const original = (await importOriginal()) as typeof import('../src/import-script');
    const importScript = (path, options) =>
      original.importScript(path, {
        ...options,
        plugins: (options?.plugins ?? []).concat(memfsPlugin),
      });
    return {
      importScript,
      default: importScript,
    };
  });

  vi.spyOn(process, 'cwd').mockReturnValue('/usr/local/project-1');
});

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vol.reset();
  vol.mkdirSync('/usr/local/project-1', { recursive: true });
});
