import type { Plugin } from 'esbuild';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

/**
 * Configuration for the raw-markdown esbuild plugin.
 */
export interface RawMarkdownPluginOptions {
  /**
   * Regex filter applied to import specifiers.
   * Only imports matching this pattern are intercepted.
   * @default /\.mdx?\?raw$/
   */
  filter?: RegExp;
}

/**
 * Creates an esbuild plugin that handles `?raw` imports for markdown
 * (`.md` / `.mdx`) files, returning their content as a default-exported string.
 *
 * The plugin is automatically included by {@link importScript}, but can be
 * added independently to a custom esbuild build.
 *
 * @param options - Optional plugin configuration.
 * @returns An esbuild `Plugin` instance.
 *
 * @example
 * ```typescript
 * import { build } from 'esbuild';
 * import { rawMarkdownPlugin } from '@equinor/fusion-imports';
 *
 * await build({
 *   entryPoints: ['src/index.ts'],
 *   plugins: [rawMarkdownPlugin()],
 *   bundle: true,
 *   format: 'esm',
 * });
 * ```
 *
 * Then in the bundled source files:
 * ```typescript
 * import readme from '../../README.md?raw';
 * ```
 */
export const rawMarkdownPlugin = (options: RawMarkdownPluginOptions = {}): Plugin => {
  const { filter = /\.mdx?\?raw$/ } = options;

  return {
    name: 'markdown-raw',
    setup(build) {
      // Handle imports ending with ?raw
      build.onResolve({ filter }, (args) => {
        // Remove the ?raw suffix to get the actual file path
        const filePath = args.path.replace(/\?raw$/, '');

        // Determine the resolve directory: use importer's directory if available, otherwise use resolveDir
        const resolveDir = args.importer
          ? path.dirname(args.importer)
          : args.resolveDir || process.cwd();

        const resolvedPath = path.isAbsolute(filePath)
          ? filePath
          : path.resolve(resolveDir, filePath);

        return {
          path: resolvedPath,
          namespace: 'markdown-raw',
        };
      });

      // Load the file content as a string
      build.onLoad({ filter: /.*/, namespace: 'markdown-raw' }, async (args) => {
        try {
          const content = await readFile(args.path, 'utf-8');
          // Export the content as a default export string
          return {
            contents: `export default ${JSON.stringify(content)};`,
            loader: 'js',
          };
        } catch (error) {
          return {
            errors: [
              {
                text: `Failed to read file: ${args.path}`,
                detail: error instanceof Error ? error.message : String(error),
              },
            ],
          };
        }
      });
    },
  };
};
