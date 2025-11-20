import { build, type BuildOptions } from 'esbuild';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { processAccessError } from './error.js';

import { readPackageUp } from 'read-package-up';
import { createImportMetaResolvePlugin } from './import-meta-resolve-plugin.js';
import { createMarkdownRawPlugin } from './markdown-plugin.js';

/**
 * Represents a Node.js module with an optional default export.
 *
 * @typedef {Object} EsmModule
 * @property {unknown} [default] - The default export of the module, if any.
 * @property {Record<string, unknown>} - Additional named exports of the module.
 */
export type EsmModule = Record<string, unknown> & {
  default?: unknown;
};

/**
 * Options for importing a script, excluding certain build options.
 *
 * @remarks when `write` is set to `false`, the output will be loaded from memory.
 *
 * This type is derived from `BuildOptions` but omits the following properties:
 * - `entryPoints`
 * - `bundle`
 * - `format`
 */
export type ImportScriptOptions = Omit<BuildOptions, 'entryPoints' | 'bundle' | 'format'>;

/**
 * Asynchronously imports a script file using esbuild to bundle it.
 *
 * @template M - The type of the module to be imported.
 * @param {string} entryPoint - The path to the script file to be imported.
 * @param {ImportScriptOptions} [options] - Optional build options to customize the bundling process.
 * @returns {Promise<M>} A promise that resolves to the imported module.
 * @throws {Error} Throws an error if the bundling process fails or no output files are generated.
 *
 * @example
 * ```typescript
 * import { importScript } from './import-script';
 *
 * (async () => {
 *   const myModule = await importScript<MyModuleType>('./path/to/my-module.ts');
 *   // Use myModule here
 * })();
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

  const packageLocalPath = await readPackageUp().then((pkg) =>
    pkg ? path.dirname(pkg?.path) : process.cwd(),
  );

  const outfile =
    options?.outfile ??
    path.join(
      packageLocalPath,
      'node_modules/.cache/esbuild',
      `${path.basename(sourceFile)}.esbuild.js`,
    );

  try {
    // Merge plugins: add default plugins if not already present
    const existingPlugins = options?.plugins ?? [];
    const hasImportMetaResolvePlugin = existingPlugins.some(
      (plugin) => plugin.name === 'import-meta-resolve',
    );
    const hasMarkdownRawPlugin = existingPlugins.some(
      (plugin) => plugin.name === 'markdown-raw',
    );
    
    const defaultPlugins = [];
    if (!hasImportMetaResolvePlugin) {
      defaultPlugins.push(createImportMetaResolvePlugin());
    }
    if (!hasMarkdownRawPlugin) {
      defaultPlugins.push(createMarkdownRawPlugin());
    }
    
    const plugins = [...defaultPlugins, ...existingPlugins];

    const buildOptions = Object.assign(
      {
        // default options
        outfile,
        platform: 'node',
        write: true,
        plugins,
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
        plugins,
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
