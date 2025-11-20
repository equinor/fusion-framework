import type { Plugin } from 'esbuild';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

/**
 * Creates an esbuild plugin that handles `?raw` imports for markdown files.
 *
 * This plugin allows importing markdown files as raw strings using the `?raw` query parameter:
 * ```typescript
 * import readmeContent from '../../README.md?raw';
 * ```
 *
 * The plugin intercepts imports ending with `?raw` (or `.md?raw`), reads the file content,
 * and returns it as a default export string.
 */
export const createMarkdownRawPlugin = (): Plugin => {
  return {
    name: 'markdown-raw',
    setup(build) {
      // Handle imports ending with ?raw
      build.onResolve({ filter: /\?raw$/ }, (args) => {
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
