import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { UserConfig } from 'vite';
import type { startVitest as StartVitest } from 'vitest/node';

import type { AppTestVitePluginOptions } from '../lib/vitest/app-test-vite-plugin.js';

import type { ConsoleLogger } from './utils/index.js';
import { resolveProjectPackage } from './helpers/resolve-project-package.js';

/**
 * Options for {@link testApplication}.
 * @public
 */
export interface TestApplicationOptions {
  /** Path to the application manifest file. */
  manifest?: string;
  /** Path to the application config file. */
  config?: string;
  /** Path to the application's module-configurator file. */
  configure?: string;
  /** Re-run tests on file changes instead of exiting after a single run. */
  watch?: boolean;
  /** Logger instance for outputting progress and debug information. */
  log?: ConsoleLogger | null;
}

/**
 * Runs the application's own Vitest suite with its manifest, config, and module-configurator
 * wired up automatically — the same resolution `ffc app build`/`ffc app dev` use.
 *
 * @remarks
 * Runs the application's own installed `vitest`, so no `vitest` dependency of the CLI itself is
 * ever loaded — this avoids a duplicate/mismatched `vitest` in the application's module graph.
 * Any test file using `@equinor/fusion-framework-react-app/vitest` picks up the resolved
 * manifest/config/`configure` with no per-file wiring.
 *
 * A throwaway `vitest.config` wrapping the application's own config (if any) plus the app-test
 * Vite plugin is written next to the application's config and passed to `startVitest` as an
 * explicit `configFile`. This is necessary because Vitest's `browser` mode re-resolves its own
 * Vite server straight from the on-disk config file for each test project — a plugin handed to
 * `startVitest` only as an in-memory `viteOverrides` object never reaches that resolution.
 *
 * @param options - Options controlling manifest/config/configure resolution and watch mode.
 * @returns A promise that resolves once the run completes (or immediately in watch mode).
 * @throws If `vitest` is not resolvable from the application package, or the run itself fails.
 * @public
 */
export const testApplication = async (options?: TestApplicationOptions): Promise<void> => {
  const { log } = options ?? {};
  const pkg = await resolveProjectPackage(log);

  log?.start('resolving local vitest...');
  const startVitest = await resolveLocalStartVitest(pkg.root);
  log?.succeed('resolved local vitest');

  const configFile = await writeAppTestVitestConfig(pkg.root, {
    cwd: pkg.root,
    manifestPath: options?.manifest,
    configPath: options?.config,
    configureModule: options?.configure,
  });

  try {
    await startVitest(
      'test',
      [],
      { root: pkg.root, watch: options?.watch ?? false },
      // `configFile` lives on Vite's `InlineConfig` (which `viteOverrides` is merged into at
      // runtime), not on the plain `UserConfig` type `startVitest` declares for this parameter
      { configFile } as UserConfig,
    );
  } finally {
    await rm(configFile, { force: true });
  }
};

const VITEST_CONFIG_CANDIDATES = [
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.cts',
  'vitest.config.js',
  'vitest.config.mjs',
  'vitest.config.cjs',
];

/** Filename for the throwaway config {@link writeAppTestVitestConfig} generates. */
const APP_TEST_CONFIG_FILENAME = '.ffc-app-test.vitest.config.mjs';

/**
 * Finds the application's own `vitest.config.*` file.
 *
 * @remarks
 * `vite`'s config loader only auto-discovers `vite.config.*` by default — it never looks for
 * `vitest.config.*` on its own, so callers must supply the concrete path themselves.
 *
 * @param root - The application package root to search in.
 * @returns The absolute path to the config file, or `undefined` if none of the candidates exist.
 */
const resolveVitestConfigFile = (root: string): string | undefined =>
  VITEST_CONFIG_CANDIDATES.map((file) => resolve(root, file)).find((file) => existsSync(file));

/**
 * Writes a throwaway `vitest.config` next to the application's own config, re-exporting it
 * merged with the app-test Vite plugin, so Vitest's own on-disk config resolution (used for
 * every test project, including each `browser`-mode one) always sees the plugin.
 *
 * @param root - The application package root.
 * @param pluginOptions - Options forwarded to `appTestVitePlugin`.
 * @returns The absolute path to the generated config file; the caller is responsible for
 * removing it once the run completes.
 */
const writeAppTestVitestConfig = async (
  root: string,
  pluginOptions: AppTestVitePluginOptions,
): Promise<string> => {
  const configFile = resolve(root, APP_TEST_CONFIG_FILENAME);
  const userConfigFile = resolveVitestConfigFile(root);
  const userConfigImport = userConfigFile
    ? `import userConfig from ${JSON.stringify(pathToFileURL(userConfigFile).href)};`
    : 'const userConfig = {};';

  // spread rather than a deep-merge helper (e.g. `vite`'s `mergeConfig`) since this file is
  // resolved from the application's own `node_modules`, which has no direct dependency on `vite`
  const source = [
    "import { appTestVitePlugin } from '@equinor/fusion-framework-cli/vitest';",
    userConfigImport,
    '',
    'export default {',
    '  ...userConfig,',
    `  plugins: [...(userConfig.plugins ?? []), appTestVitePlugin(${JSON.stringify(pluginOptions)})],`,
    '};',
    '',
  ].join('\n');

  await writeFile(configFile, source, 'utf8');
  return configFile;
};

/**
 * Resolves `vitest/node`'s `startVitest` from the application package's own `node_modules`,
 * rather than whatever `vitest` (if any) is installed alongside the CLI itself.
 */
const resolveLocalStartVitest = async (root: string): Promise<typeof StartVitest> => {
  const require = createRequire(pathToFileURL(resolve(root, 'package.json')));
  try {
    const vitestNode = await import(require.resolve('vitest/node'));
    return vitestNode.startVitest;
  } catch (err) {
    throw new Error(
      '`ffc app test` requires "vitest" to be installed in the application package.',
      { cause: err },
    );
  }
};

export default testApplication;
