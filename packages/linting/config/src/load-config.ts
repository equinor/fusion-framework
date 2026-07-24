import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { importConfig, resolveConfigFile, FileNotFoundError } from '@equinor/fusion-imports';
import type { LintConfig, Rule } from '@equinor/fusion-framework-lint-core';
import { ConfigBuilder } from './config-builder.js';
import type { LoadedLintConfig } from './config-builder.js';
import type { FusionLintFileConfig, FusionLintConfigFactory } from './define-config.js';

/** Config file basenames searched in order. */
const CONFIG_BASENAMES = ['fusion-lint.config', '.fusion-lintrc'] as const;

/** Extensions probed per basename (TypeScript first, then JS, JSON, and YAML). */
const CONFIG_EXTENSIONS = ['.ts', '.js', '.json', '.yml', '.yaml'] as const;

/**
 * Options accepted by {@link loadLintConfig}.
 */
export interface LoadLintConfigOptions {
  /**
   * Directory to search for the configuration file.
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Base config passed to factory-style configs as the first argument.
   * Typically the `recommendedConfig` preset.
   * @default {}
   */
  base?: LintConfig;
}

/**
 * Returns `true` when `value` is the rich `{ rules?, customRules? }` object
 * format rather than a flat `LintConfig` map.
 */
function isRichConfig(
  value: FusionLintFileConfig,
): value is { rules?: LintConfig; customRules?: Rule[] } {
  // Guard: flat configs have only string values; rich configs have object/array sub-keys
  return 'rules' in value || 'customRules' in value;
}

/**
 * Normalises any supported file format to a {@link LoadedLintConfig}.
 */
function normalise(raw: FusionLintFileConfig): LoadedLintConfig {
  // Rich format: extract rules and customRules separately
  if (isRichConfig(raw)) {
    return { config: raw.rules ?? {}, customRules: raw.customRules ?? [] };
  }
  // Flat format: the entire object is the severity map
  return { config: raw as LintConfig, customRules: [] };
}

/**
 * Loads a `fusion-lint` configuration file from the given directory.
 *
 * Searches for `fusion-lint.config` or `.fusion-lintrc` with extensions
 * `.ts`, `.js`, `.json`, `.yml`, or `.yaml` — in that order.
 *
 * TypeScript / JavaScript configs are bundled at runtime via esbuild (through
 * `@equinor/fusion-imports`) and must use a **default export**.  They may use
 * either the flat or rich {@link FusionLintFileConfig} format.
 *
 * JSON and YAML configs support the flat severity map only.
 *
 * @param options - Optional loader settings.
 * @returns The {@link LoadedLintConfig}, or `null` when no config file is found.
 * @throws {Error} When a config file exists but cannot be read or parsed.
 */
export async function loadLintConfig(
  options: LoadLintConfigOptions = {},
): Promise<LoadedLintConfig | null> {
  const baseDir = options.cwd ?? process.cwd();

  let filePath: string;

  try {
    // Find the first accessible config file across all basenames and extensions
    filePath = await resolveConfigFile([...CONFIG_BASENAMES], {
      baseDir,
      extensions: [...CONFIG_EXTENSIONS],
    });
  } catch (err) {
    // Guard: no config file present — caller falls back to defaults
    if (err instanceof FileNotFoundError) return null;
    throw err;
  }

  // YAML files are not handled by importConfig — parse them directly
  if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
    const raw = await readFile(filePath, 'utf-8');
    // Guard: empty or comment-only YAML files parse to null — treat as empty config
    const parsed = (parseYaml(raw) ?? {}) as FusionLintFileConfig;
    return normalise(parsed);
  }

  // Delegate TS / JS / JSON loading to fusion-imports (esbuild-backed)
  const { config: rawExport } = await importConfig<FusionLintFileConfig | FusionLintConfigFactory>(
    filePath,
  );
  // Support builder factory: `export default defineConfig((args) => { ... })`
  if (typeof rawExport === 'function') {
    const builder = new ConfigBuilder();
    await rawExport(builder);
    return builder.resolve(options.base ?? {});
  }
  return normalise(rawExport);
}
