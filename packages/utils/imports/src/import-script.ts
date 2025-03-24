import { build, type BuildOptions } from 'esbuild';
import { access } from 'node:fs/promises';
import path from 'node:path';

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
 * This type is derived from `BuildOptions` but omits the following properties:
 * - `entryPoints`
 * - `write`
 * - `bundle`
 * - `format`
 */
export type ImportScriptOptions = Omit<BuildOptions, 'entryPoints' | 'write' | 'bundle' | 'format'>;

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
    throw new Error(`The file '${entryPoint}' does not exist or cannot be accessed`, {
      cause: error,
    });
  }

  try {
    const buildOptions = Object.assign(
      {
        // default options
        platform: 'node',
      },
      options, // provided options
      {
        // non-overridable options
        entryPoints: [sourceFile],
        write: false,
        bundle: true,
        format: 'esm',
      },
    ) as BuildOptions;

    const result = await build(buildOptions);

    // Ensure that at least one output file was generated
    const [output] = result.outputFiles ?? [];
    if (!output) {
      throw new Error(`No output files generated for '${entryPoint}'`);
    }

    // Create a data URL from the bundled script
    const dataUrl = `data:text/javascript;base64,${Buffer.from(output.text).toString('base64')}`;

    return import(dataUrl);
  } catch (error) {
    throw new Error(
      `Failed to bundle '${entryPoint}' with esbuild. Check for syntax errors or unresolved imports.`,
      { cause: error },
    );
  }
};

export default importScript;
