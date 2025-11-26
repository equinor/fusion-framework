import type { Plugin } from 'esbuild';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

/**
 * Options for configuring the markdown raw plugin.
 */
export interface MarkdownRawPluginOptions {
  /**
   * Regular expression filter to match file imports.
   * @default /\.mdx?\?raw$/
   */
  filter?: RegExp;
}

/**
 * Creates an esbuild plugin that handles `?raw` imports for markdown files.
 *
 * This plugin allows importing markdown files as raw strings using the `?raw` query parameter:
 * ```typescript
 * import readmeContent from '../../README.md?raw';
 * import mdxContent from '../../docs/guide.mdx?raw';
 * ```
 *
 * The plugin intercepts imports ending with `?raw` (or `.md?raw`/`.mdx?raw`), reads the file content,
 * and returns it as a default export string.
 *
 * @param options - Configuration options for the plugin
 * @returns An esbuild plugin
 */
export const createMarkdownRawPlugin = (options: MarkdownRawPluginOptions = {}): Plugin => {
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
