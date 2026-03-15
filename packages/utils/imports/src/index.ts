/**
 * @packageDocumentation
 *
 * Utilities for importing and transpiling TypeScript, JavaScript, and JSON
 * configuration files at Node.js runtime using esbuild.
 *
 * Use {@link importConfig} to load a configuration file by basename,
 * {@link importScript} to bundle and import a single script module, or
 * {@link importJSON} to read and parse a JSON file from disk.
 *
 * @remarks
 * This package is designed for **file-based** imports, not URL-based.
 * It bundles the target with esbuild (ESM, external packages) and
 * loads the result via dynamic `import()`.
 */

export { importScript, type EsmModule, type ImportScriptOptions } from './import-script.js';
export { importJSON } from './import-json.js';
export {
  default,
  importConfig,
  type ConfigContent,
  type ImportConfigResult,
} from './import-config.js';
export { resolveConfigFile, type ResolveConfigFileOptions } from './resolve-config-file.js';
export { importMetaResolvePlugin as createImportMetaResolvePlugin } from './import-meta-resolve-plugin.js';
export { rawMarkdownPlugin, type RawMarkdownPluginOptions } from './markdown-plugin.js';

export { FileNotFoundError, FileNotAccessibleError } from './error.js';
