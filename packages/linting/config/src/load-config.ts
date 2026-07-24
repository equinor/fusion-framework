import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve as resolvePath } from 'node:path';
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
   * Directory to start searching for the configuration file from.
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Base config passed to factory-style configs as the first argument.
   * Typically the `recommendedConfig` preset.
   * @default {}
   */
  base?: LintConfig;
  /**
   * When `true`, searches parent directories for a config file if none is
   * found in `cwd` — useful when linting a file deep inside a monorepo
   * package that inherits its config from the repo root. The search stops
   * after checking the directory containing `.git` (the repo root), so it
   * never reads a config from outside the current repository.
   * @default true
   */
  findUp?: boolean;
}

/**
 * Returns `true` when `dir` contains a `.git` entry (directory or file, the
 * latter used by git worktrees), marking it as the repository root.
 */
async function isRepoRoot(dir: string): Promise<boolean> {
  try {
    await access(join(dir, '.git'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the first accessible config file starting at `startDir`, walking
 * up through parent directories when `findUp` is enabled. The walk stops
 * after checking the repository root (detected via `.git`), or at the
 * filesystem root if no `.git` is found.
 */
async function resolveConfigFileUpwards(startDir: string, findUp: boolean): Promise<string> {
  let dir = resolvePath(startDir);

  // Directory-walk loop: try each directory, then step up unless a boundary was hit
  while (true) {
    try {
      return await resolveConfigFile([...CONFIG_BASENAMES], {
        baseDir: dir,
        extensions: [...CONFIG_EXTENSIONS],
      });
    } catch (err) {
      // Anything other than "not found in this directory" is a real failure — propagate it
      if (!(err instanceof FileNotFoundError)) throw err;
    }
    // Parent of the filesystem root is itself — that's the walk-terminating condition below
    const parent = dirname(dir);
    // Guard: find-up disabled, or repo/filesystem root already checked — stop searching
    if (!findUp || parent === dir || (await isRepoRoot(dir))) {
      throw new FileNotFoundError(
        `No configuration file found for basename '${CONFIG_BASENAMES.join("', '")}'`,
      );
    }
    dir = parent;
  }
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
 * Loads a `fusion-lint` configuration file, searching from `cwd` upward
 * through parent directories (stopping at the repository root) unless
 * `findUp` is disabled.
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
    // Find the first accessible config file, walking up to the repo root when enabled
    filePath = await resolveConfigFileUpwards(baseDir, options.findUp ?? true);
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
