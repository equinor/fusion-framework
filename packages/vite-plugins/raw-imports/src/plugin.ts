import type { Plugin } from 'vite';
import path from 'node:path';
import { readFileSync } from 'node:fs';

/**
 * Configuration options for {@link rawImportsPlugin}.
 *
 * @remarks
 * Use these options to control which file extensions the plugin handles.
 * Any import whose extension is **not** listed here falls through to
 * Vite's built-in `?raw` handler, so existing image or shader imports
 * remain unaffected.
 */
export interface RawImportsPluginOptions {
  /**
   * File extensions the plugin will intercept for `?raw` imports.
   *
   * @remarks
   * Each entry must include the leading dot (e.g. `'.md'`, `'.txt'`).
   * Matching is case-insensitive.
   *
   * @defaultValue `['.md']`
   */
  extensions?: string[];

  /**
   * Subdirectory for emitted asset files within the build output.
   *
   * @defaultValue `'assets'`
   */
  assetDir?: string;
}

/**
 * Create a Vite plugin that embeds `?raw` file imports as inline string modules.
 *
 * @remarks
 * Use `rawImportsPlugin` when you need reliable raw-string imports in
 * **Vite library mode** (`build.lib`) or when Vite's built-in `?raw`
 * handling produces incorrect paths for deeply nested relative imports.
 *
 * The plugin:
 * 1. Intercepts every `import … from '…?raw'` whose extension matches
 *    the configured list (markdown by default).
 * 2. Resolves the file path relative to the importer (or `process.cwd()`
 *    as a fallback).
 * 3. Reads the file from disk and returns a virtual JavaScript module
 *    that exports the content as a default string.
 * 4. Runs in the `'pre'` enforcement phase so it takes priority over
 *    Vite's native asset handler.
 *
 * Imports whose extension is **not** in the configured list are ignored
 * and handled by Vite's built-in `?raw` support.
 *
 * @param options - Optional plugin configuration.
 * @param options.extensions - File extensions to intercept (default: `['.md']`).
 * @returns A Vite `Plugin` object with `resolveId` and `load` hooks.
 *
 * @throws {Error} When a matched file cannot be read from disk during the
 *   `load` phase.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';
 *
 * export default {
 *   plugins: [
 *     rawImportsPlugin({ extensions: ['.md', '.txt'] }),
 *   ],
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Import a markdown file as a raw string at build time
 * import readme from '../../README.md?raw';
 * console.log(readme); // full markdown content embedded in the bundle
 * ```
 */
export const rawImportsPlugin = (options?: RawImportsPluginOptions): Plugin => {
  // Default extensions: only markdown files by default
  const defaultExtensions = ['.md'];
  const extensions = options?.extensions ?? defaultExtensions;
  const assetDir = options?.assetDir ?? 'assets';

  // Track whether we are in build mode (emitFile is only available during build)
  let isBuild = false;

  /**
   * Check whether a file path ends with one of the configured extensions.
   *
   * @param filePath - Absolute or relative file path to test.
   * @returns `true` when the path's extension matches a configured entry.
   */
  const matchesExtension = (filePath: string): boolean => {
    return extensions.some((ext) => path.extname(filePath) === ext.toLowerCase());
  };
  return {
    name: 'fusion-framework-vite-plugin-raw-imports',
    enforce: 'pre', // Run before other plugins
    configResolved(config) {
      isBuild = config.command === 'build';
    },
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

          if (isBuild) {
            // During build, emit as a separate asset so the content is
            // not inlined into the main bundle. Vite 8's import-analysis
            // parser chokes on very long string literals in served bundles.
            const basename = path.basename(resolvedPath);
            const name = assetDir ? `${assetDir}/${basename}` : basename;
            const refId = this.emitFile({
              type: 'asset',
              name,
              source: content,
            });
            return `export default import.meta.ROLLUP_FILE_URL_${refId};`;
          }

          // During dev, inline the content directly — Vite's dev server
          // transforms files individually so the long-string issue doesn't apply.
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
