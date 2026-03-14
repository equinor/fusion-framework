import path from 'node:path';
import { importScript, type ImportScriptOptions, type EsmModule } from './import-script.js';
import { importJSON } from './import-json.js';
import { resolveConfigFile } from './resolve-config-file.js';

/**
 * Union of value types that a configuration file may produce.
 *
 * Covers objects, arrays, primitives, and `null` — essentially any valid
 * JSON-compatible shape that a config script or JSON file can export.
 */
// biome-ignore lint/suspicious/noExplicitAny: allow any for flexibility in config content
export type ConfigContent = Record<any, any> | any[] | string | number | boolean | null;

/**
 * Options for {@link importConfig}.
 *
 * @template C - Configuration value type.
 * @template M - ES module type for script-based imports.
 */
type ImportConfigOptions<
  C extends ConfigContent = ConfigContent,
  M extends EsmModule = EsmModule,
> = {
  /** Base directory for resolving the configuration file (default: `process.cwd()`). */
  baseDir?: string;
  /** File extensions to probe, in order (default: `['.ts', '.mjs', '.js', '.json']`). */
  extensions?: string[];
  /** Options specific to script-based (non-JSON) imports. */
  script?: {
    /**
     * Callback that extracts the configuration value from the imported module.
     * Defaults to returning `module.default`.
     */
    resolve?: (module: M) => C | Promise<C>;
    /** Esbuild build-option overrides forwarded to {@link importScript}. */
    esBuildOptions?: ImportScriptOptions;
  };
};

/**
 * Result returned by {@link importConfig} containing the resolved file path,
 * its extension, and the loaded configuration value.
 *
 * @template C - The configuration value type.
 */
export type ImportConfigResult<C extends ConfigContent> = {
  /** Absolute path of the resolved configuration file. */
  path: string;
  /** File extension including the leading dot (e.g. `'.ts'`, `'.json'`). */
  extension: string;
  /** The loaded and optionally transformed configuration value. */
  config: C;
};

/**
 * Loads a configuration file by basename, automatically resolving the file
 * extension (`.ts` → `.mjs` → `.js` → `.json`) and using the appropriate
 * import strategy.
 *
 * - **JSON files** are read and parsed with {@link importJSON}.
 * - **Script files** (TypeScript / JavaScript) are bundled with esbuild via
 *   {@link importScript} and the module's `default` export is returned unless
 *   a custom `script.resolve` callback is provided.
 *
 * @template C - The configuration value type.
 * @template M - The shape of the ES module when importing a script file.
 *
 * @param basename  - File basename (without extension), or an array of
 *   basenames to try in order.
 * @param options   - Import behaviour overrides (base directory, extensions,
 *   script resolver, esbuild options).
 * @returns An {@link ImportConfigResult} containing the resolved path,
 *   extension, and loaded configuration value.
 * @throws {FileNotFoundError} When no matching file is found for any basename.
 * @throws {Error} When esbuild bundling or JSON parsing fails.
 *
 * @example
 * ```typescript
 * const { config } = await importConfig<AppSettings>('app.config');
 * ```
 */
export async function importConfig<C extends ConfigContent, M extends EsmModule = EsmModule>(
  basename: string | string[],
  options: ImportConfigOptions<C, M> = {},
): Promise<ImportConfigResult<C>> {
  const { baseDir, extensions, script } = options;
  const filePath = await resolveConfigFile(basename, { baseDir, extensions });
  const fileExt = path.extname(filePath);

  const config = await (async () => {
    switch (fileExt) {
      case '.json':
        return importJSON<C>(filePath);
      default: {
        const resolve = script?.resolve ?? ((module: M) => module.default as C);
        const module = await importScript<M>(filePath, script?.esBuildOptions);
        return resolve(module);
      }
    }
  })();
  return {
    path: filePath,
    extension: fileExt,
    config,
  };
}

export default importConfig;
