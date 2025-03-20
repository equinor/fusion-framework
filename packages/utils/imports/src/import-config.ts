import path from 'node:path';
import { importScript, type ImportScriptOptions, type EsmModule } from './import-script';
import { importJSON } from './import-json';
import { resolveConfigFile } from './resolve-config-file';

export type ConfigContent = Record<string, unknown> | unknown[] | string | number | boolean | null;

/**
 * Options for configuring the import behavior.
 *
 * @template C - The type of the configuration content. Defaults to `ConfigContent`.
 * @template M - The type of the ES module. Defaults to `EsmModule`.
 *
 * @property {string} [baseDir] - The base directory to resolve imports from.
 * @property {string[]} [extensions] - An array of file extensions to consider during import resolution.
 * @property {Object} [script] - Configuration for script-based imports.
 * @property {(module: M) => C} [script.resolve] - A function to resolve the imported module into the desired configuration content.
 * @property {ImportScriptOptions} [script.esBuildOptions] - Additional options for configuring the ESBuild process during script imports.
 */
type ImportConfigOptions<
  C extends ConfigContent = ConfigContent,
  M extends EsmModule = EsmModule,
> = {
  baseDir?: string;
  extensions?: string[];
  script?: {
    resolve?: (module: M) => C;
    esBuildOptions?: ImportScriptOptions;
  };
};

/**
 * Imports a configuration file based on the provided basename and options.
 *
 * @template C - The type of the configuration content.
 * @template M - The type of the ES module, defaults to `EsmModule`.
 *
 * @param {string} basename - The base name of the configuration file to import.
 * @param {ImportConfigOptions<C, M>} [options={}] - Optional parameters for importing the configuration.
 * @param {string} [options.baseDir] - The base directory to resolve the configuration file from.
 * @param {string[]} [options.extensions] - The list of file extensions to consider when resolving the configuration file.
 * @param {object} [options.script] - Additional script options for importing non-JSON files.
 *
 * @returns {Promise<C>} A promise that resolves to the imported configuration content.
 *
 * @throws Will throw an error if the configuration file cannot be resolved or imported.
 */
export async function importConfig<C extends ConfigContent, M extends EsmModule = EsmModule>(
  basename: string,
  options: ImportConfigOptions<C, M> = {},
): Promise<C> {
  const { baseDir, extensions, script } = options;
  const filePath = await resolveConfigFile(basename, { baseDir, extensions });
  const fileExtension = path.extname(filePath);

  switch (fileExtension) {
    case '.json':
      return importJSON<C>(filePath);
    default: {
      const resolve = script?.resolve ?? ((module: M) => module.default as C);
      const module = await importScript<M>(filePath, script?.esBuildOptions);
      return resolve(module);
    }
  }
}

export default importConfig;
