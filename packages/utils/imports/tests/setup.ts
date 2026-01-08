import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { dirname, extname, resolve } from 'node:path';

import type { Plugin as EsBuildPlugin, Loader } from 'esbuild';

import { vol } from 'memfs';
import { importMetaResolvePlugin } from '../src/import-meta-resolve-plugin';
import { rawMarkdownPlugin } from '../src/markdown-plugin';

export const memfsPlugin: EsBuildPlugin = {
  name: 'memfs',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      // Strip query parameters (e.g., ?raw) from the path
      const pathWithoutQuery = args.path.split('?')[0];

      // If it's the entry point, use the absolute path directly
      if (args.kind === 'entry-point') {
        return { path: pathWithoutQuery, namespace: 'memfs' };
      }

      // For imports, resolve relative to the importer's directory
      // Imports: resolve relative to importer's directory
      const importerDir = dirname(args.importer);
      let resolvedPath = resolve(importerDir, pathWithoutQuery);

      // Append .ts if no extension (match mockFiles)
      if (!extname(resolvedPath)) {
        resolvedPath += '.ts'; // Adjust to .js if needed
      }

      return { path: resolvedPath, namespace: 'memfs' };
    });
    build.onLoad({ filter: /.*/, namespace: 'memfs' }, async (args) => {
      // Strip query parameters from path before reading (in case they weren't stripped in onResolve)
      const [pathWithoutQuery, query] = args.path.split('?');
      const contents = String(vol.readFileSync(pathWithoutQuery, 'utf-8'));

      // Determine loader based on file extension
      // For ?raw imports (like markdown), use 'text' loader
      // Check if original path had ?raw query parameter
      const hasRawQuery = query === 'raw';
      if (hasRawQuery) {
        return { contents, loader: 'text' };
      }

      const ext = extname(pathWithoutQuery).slice(1);
      const loader = ['js', 'ts', 'jsx', 'tsx', 'json'].includes(ext) ? (ext as Loader) : 'text';
      return { contents, loader };
    });

    build.onEnd((result) => {
      for (const file of result.outputFiles ?? []) {
        const { path, contents } = file;
        vol.mkdirSync(dirname(path), { recursive: true });
        vol.writeFileSync(path, contents);
      }
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
    const importScript = (path, options) => {
      const plugins = [memfsPlugin].concat(
        options?.plugins ?? [rawMarkdownPlugin(), importMetaResolvePlugin()],
      );
      return original.importScript(path, {
        ...options,
        plugins,
        write: false,
      });
    };
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
