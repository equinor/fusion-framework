import { build, type BuildOptions } from 'esbuild';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { processAccessError } from './error.js';

import { readPackageUp } from 'read-package-up';
import { importMetaResolvePlugin } from './import-meta-resolve-plugin.js';
import { rawMarkdownPlugin } from './markdown-plugin.js';

/**
 * Shape of an ESM module returned by {@link importScript}.
 *
 * Every named export is accessible as a string-keyed property.
 * The optional `default` property holds the module's default export, if one
 * exists.
 */
export type EsmModule = Record<string, unknown> & {
  default?: unknown;
};

/**
 * Esbuild build-options subset accepted by {@link importScript}.
 *
 * Inherits all `esbuild.BuildOptions` except `entryPoints`, `bundle`, and
 * `format`, which are controlled internally.
 *
 * @remarks
 * When `write` is `false` the bundled output is loaded from memory via a
 * `data:` URL instead of being written to disk.
 */
export type ImportScriptOptions = Omit<BuildOptions, 'entryPoints' | 'bundle' | 'format'>;

/**
 * Bundles a TypeScript or JavaScript file with esbuild and dynamically imports
 * the resulting ESM module.
 *
 * The function resolves the entry point, bundles it in ESM format with all
 * npm packages marked as external, and loads the output via `import()`. Two
 * built-in esbuild plugins are included automatically:
 *
 * - {@link createImportMetaResolvePlugin | importMetaResolvePlugin} — resolves
 *   `import.meta.resolve()` calls for relative paths at build time.
 * - {@link rawMarkdownPlugin} — supports `?raw` imports for markdown files.
 *
 * @template M - Module shape returned by the dynamic import.
 * @param entryPoint - Path to the script file to bundle and import.
 * @param options    - Optional esbuild build options (see {@link ImportScriptOptions}).
 * @returns The imported module.
 * @throws {FileNotFoundError} When the entry point does not exist.
 * @throws {FileNotAccessibleError} When the entry point cannot be read.
 * @throws {Error} When esbuild bundling fails or produces no output.
 *
 * @example
 * ```typescript
 * interface MyModule { greet(name: string): string }
 * const mod = await importScript<MyModule>('./greet.ts');
 * console.log(mod.greet('World'));
 * ```
 */
export const importScript = async <M extends EsmModule>(
  entryPoint: string,
  options?: ImportScriptOptions,
): Promise<M> => {
  const sourceFile = path.resolve(entryPoint);

  try {
    await access(sourceFile);
  } catch (error) {
    throw processAccessError(error, sourceFile);
  }

  // Start searching for package.json from the entry point's directory
  // This ensures we find the correct workspace root, not a parent directory
  const entryDir = path.dirname(sourceFile);
  const packageLocalPath = await readPackageUp({ cwd: entryDir }).then((pkg) =>
    pkg ? path.dirname(pkg?.path) : entryDir,
  );

  const outfile =
    options?.outfile ??
    path.join(
      packageLocalPath,
      'node_modules/.cache/esbuild',
      `${path.basename(sourceFile)}.esbuild.js`,
    );

  try {
    const buildOptions = Object.assign(
      {
        // default options
        outfile,
        platform: 'node',
        write: true,
        plugins: [importMetaResolvePlugin(), rawMarkdownPlugin()],
        // Enable metafile so the plugin can find output files when write: true
        metafile: true,
      },
      options, // provided options
      {
        // non-overridable options
        outdir: undefined,
        entryPoints: [sourceFile],
        bundle: true,
        packages: 'external',
        format: 'esm',
        // Override plugins to ensure import-meta-resolve is included
        // Ensure metafile is enabled for the plugin to work with write: true
        metafile: options?.metafile ?? true,
      },
    ) as BuildOptions;

    const result = await build(buildOptions);

    if (!buildOptions.write) {
      // If write is false, we need to write the output files manually
      // Ensure that at least one output file was generated
      const [output] = result.outputFiles ?? [];
      if (!output) {
        throw new Error(`No output files generated for '${entryPoint}'`);
      }

      // Create a data URL from the bundled script
      const dataUrl = `data:text/javascript;base64,${Buffer.from(output.text).toString('base64')}`;
      return import(dataUrl);
    }

    // Convert the outfile path to a file:// URL to ensure compatibility with ESM loader on Windows
    return import(pathToFileURL(outfile).href);
  } catch (error) {
    throw new Error(
      `Failed to bundle '${entryPoint}' with esbuild. Check for syntax errors or unresolved imports.`,
      { cause: error },
    );
  }
};

export default importScript;
