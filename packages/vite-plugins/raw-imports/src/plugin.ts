import type { Plugin } from 'vite';
import path from 'node:path';
import { readFileSync } from 'node:fs';

/**
 * Options for configuring the raw imports plugin.
 */
export interface RawImportsPluginOptions {
  /**
   * File extensions to handle with this plugin.
   * Files with other extensions will be handled by Vite's built-in `?raw` support.
   */
  extensions?: string[];
}

/**
 * Creates a Vite plugin that handles raw file imports with the `?raw` suffix.
 *
 * @remarks
 * This plugin intercepts imports ending with `?raw` for files matching the configured extensions
 * (markdown files by default) and returns their content as an inline string module. Unlike Vite's
 * default `?raw` behavior which treats files as static assets, this plugin embeds the content
 * directly in the JavaScript bundle, making it accessible at runtime without separate asset loading.
 *
 * The plugin:
 * - Resolves file paths relative to the importer or working directory
 * - Reads file contents and exports them as JavaScript string modules
 * - Runs in the 'pre' enforcement phase before other plugins
 *
 * @param options - Configuration options for the plugin
 * @param options.extensions - Array of file extensions to handle (default: `['.md']`)
 *
 * @returns A Vite plugin object with `resolveId` and `load` hooks
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { rawImportsPlugin } from '@fusion-framework/vite-plugin-raw-imports';
 *
 * export default {
 *   plugins: [
 *     rawImportsPlugin({ extensions: ['.md', '.txt'] })
 *   ]
 * };
 *
 * // In your code
 * import content from './README.md?raw';
 * console.log(content); // Raw markdown content as string
 * ```
 */
export const rawImportsPlugin = (options?: RawImportsPluginOptions): Plugin => {
  // Default extensions: only markdown files by default
  const defaultExtensions = ['.md'];
  const extensions = options?.extensions ?? defaultExtensions;

  /**
   * Checks if a file path matches one of the configured extensions.
   * Uses path.extname() to properly extract the extension.
   */
  const matchesExtension = (filePath: string): boolean => {
    return extensions.some((ext) => path.extname(filePath) === ext.toLowerCase());
  };
  return {
    name: 'fusion-framework-vite-plugin-raw-imports',
    enforce: 'pre', // Run before other plugins
    resolveId(id, importer) {
      // Check if the import ends with ?raw and matches our configured extensions
      if (id.endsWith('?raw')) {
        // Remove the ?raw suffix to get the actual file path
        const filePath = id.replace(/\?raw$/, '');

        // Only handle files with configured extensions - let Vite handle others
        if (!matchesExtension(filePath)) {
          return null; // Let Vite's built-in handler process this
        }
        // Resolve the path relative to the importer if it's a relative path
        let resolvedPath: string;
        if (path.isAbsolute(filePath)) {
          resolvedPath = path.normalize(filePath);
        } else if (importer) {
          // Normalize importer path (handle file:// URLs and other formats)
          const normalizedImporter = importer.startsWith('file://')
            ? importer.replace('file://', '')
            : importer;
          const importerDir = path.dirname(normalizedImporter);
          resolvedPath = path.resolve(importerDir, filePath);
        } else {
          // Fallback to current working directory
          resolvedPath = path.resolve(process.cwd(), filePath);
        }

        // Ensure the path is normalized and absolute
        resolvedPath = path.normalize(resolvedPath);

        // Return a virtual module ID with the resolved path
        return `\0raw:${resolvedPath}`;
      }
      return null;
    },
    load(id) {
      // Check if this is our virtual module
      if (id.startsWith('\0raw:')) {
        // Extract the resolved file path
        let resolvedPath = id.slice(6); // Remove '\0raw:' prefix

        // Ensure the path is normalized
        resolvedPath = path.normalize(resolvedPath);

        // Ensure the path is absolute (handle case where leading slash might be missing)
        if (!path.isAbsolute(resolvedPath)) {
          // On Unix systems, prepend '/' if missing
          if (process.platform !== 'win32' && !resolvedPath.startsWith('/')) {
            resolvedPath = `/${resolvedPath}`;
          } else {
            // Otherwise resolve relative to cwd
            resolvedPath = path.resolve(process.cwd(), resolvedPath);
          }
        }

        try {
          // Read the file content
          const content = readFileSync(resolvedPath, 'utf-8');

          // Return the content as a JavaScript module with default export
          return `export default ${JSON.stringify(content)};`;
        } catch (error) {
          // Throw an error if the file cannot be read
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to read file: ${resolvedPath}. ${errorMessage}`);
        }
      }
      return null;
    },
  };
};

export default rawImportsPlugin;
