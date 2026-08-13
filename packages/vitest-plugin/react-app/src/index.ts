import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { FileNotFoundError } from '@equinor/fusion-imports';
import type { Plugin } from 'vite';

import { resolveAppTestEnv, type ResolveAppTestEnvOptions } from './resolve-app-test-env.js';

const ENV_MODULE_ID = 'virtual:fusion-app-test-env';
const CONFIGURE_MODULE_ID = 'virtual:fusion-app-test-configure';
const RESOLVED_ENV_MODULE_ID = `\0${ENV_MODULE_ID}`;
const RESOLVED_CONFIGURE_MODULE_ID = `\0${CONFIGURE_MODULE_ID}`;

const DEFAULT_CONFIGURE_CANDIDATES = ['src/config.ts', 'src/config.tsx', 'src/config.js'];

/**
 * Options for {@link appTestVitePlugin}.
 */
export type AppTestVitePluginOptions = ResolveAppTestEnvOptions & {
  /**
   * Path (relative to `entrypoint`) to the app's module-configurator export, mirroring the
   * `configure` argument passed to `makeComponent` in the app's own entry point. Defaults to the
   * first of `src/config.ts`, `src/config.tsx`, `src/config.js` that exists.
   *
   * @remarks
   * Unlike `manifest`/`config`, this can't be an inline function: it's live application code
   * (with its own imports and closures) re-exported as-is into the test bundle rather than
   * JSON-serialized data, so Vite needs a real file on disk to resolve and transform.
   */
  configure?: string;
};

/**
 * Vite plugin serving an application's manifest/config (resolved the same way `ffc app build`/
 * `ffc app dev` do) and its own module-configurator export as virtual modules, so
 * `@equinor/fusion-framework-vitest-plugin-react-app/test`'s `test`/`render` need no per-test
 * `env`/`configure` wiring.
 *
 * @remarks
 * A plain Vite plugin — Vitest configs are Vite configs, so this registers directly in your
 * own `vitest.config.ts`, no CLI command required:
 * ```ts
 * import { defineConfig } from 'vitest/config';
 * import { appTestVitePlugin } from '@equinor/fusion-framework-vitest-plugin-react-app';
 *
 * export default defineConfig({
 *   plugins: [appTestVitePlugin()],
 *   // ...your own browser-mode config
 * });
 * ```
 * Exposes two virtual modules: `virtual:fusion-app-test-env` (`manifest`/`config`, as JSON) and
 * `virtual:fusion-app-test-configure` (a re-export of the resolved `configure` module, or
 * `undefined` if none exists). Not intended to be imported directly by application code.
 *
 * @param options - Resolution options; `entrypoint` defaults to the current working directory.
 * @returns A Vite plugin instance.
 */
export const appTestVitePlugin = (options?: AppTestVitePluginOptions): Plugin => {
  const cwd = options?.entrypoint ?? process.cwd();
  const configureModulePath = resolveConfigureModulePath(cwd, options?.configure);

  return {
    name: 'fusion:app-test',
    resolveId(id) {
      // claim only our two virtual specifiers, leave everything else to the normal resolvers
      if (id === ENV_MODULE_ID) return RESOLVED_ENV_MODULE_ID;
      // second virtual specifier, same rule as above
      if (id === CONFIGURE_MODULE_ID) return RESOLVED_CONFIGURE_MODULE_ID;
      return null;
    },
    async load(id) {
      // serves manifest/config resolved lazily here, not at plugin-creation time, so options.entrypoint changes between test runs are respected
      if (id === RESOLVED_ENV_MODULE_ID) {
        const { manifest, config } = await resolveAppTestEnv(options);
        return [
          `export const manifest = ${JSON.stringify(manifest)};`,
          `export const config = ${JSON.stringify(config)};`,
        ].join('\n');
      }
      // no conventional module means the app registers no extra modules, same as omitting `configure` from `makeComponent`
      if (id === RESOLVED_CONFIGURE_MODULE_ID) {
        return configureModulePath
          ? `export { default as configure } from ${JSON.stringify(configureModulePath)};`
          : 'export const configure = undefined;';
      }
      return null;
    },
  };
};

/**
 * Resolves the app's module-configurator file: the explicit `file` if given, otherwise the
 * first existing candidate in {@link DEFAULT_CONFIGURE_CANDIDATES}.
 *
 * @throws {@link FileNotFoundError} If an explicitly requested `file` does not exist — unlike
 * the convention-based lookup, a typo here should fail loudly instead of silently running the
 * test suite without the application's modules.
 */
const resolveConfigureModulePath = (cwd: string, file?: string): string | undefined => {
  // an explicit path is a user request, not a convention lookup, so a typo must fail loudly
  if (file) {
    const resolved = resolve(cwd, file);
    // fail fast rather than silently falling back to "no configurator"
    if (!existsSync(resolved)) {
      throw new FileNotFoundError(`Configure module not found: ${resolved}`);
    }
    return resolved;
  }
  // first candidate that exists wins; none existing is a valid "no configurator" state
  const found = DEFAULT_CONFIGURE_CANDIDATES.find((candidate) =>
    existsSync(resolve(cwd, candidate)),
  );
  return found ? resolve(cwd, found) : undefined;
};

export default appTestVitePlugin;
