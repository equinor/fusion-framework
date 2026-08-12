import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

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
   * Path (relative to `cwd`) to the app's module-configurator export, mirroring the `configure`
   * argument passed to `makeComponent` in the app's own entry point. Defaults to the first of
   * `src/config.ts`, `src/config.tsx`, `src/config.js` that exists.
   */
  configureModule?: string;
};

/**
 * Vite plugin backing `ffc app test`: serves the application's manifest/config (resolved the
 * same way `ffc app build`/`ffc app dev` do) and its own module-configurator export as virtual
 * modules, so `@equinor/fusion-framework-react-app/vitest`'s `test` needs no per-test
 * `env`/`configure` wiring.
 *
 * @remarks
 * Exposes two virtual modules: `virtual:fusion-app-test-env` (`manifest`/`config`, as JSON) and
 * `virtual:fusion-app-test-configure` (a re-export of the resolved `configure` module, or
 * `undefined` if none exists). Not intended to be imported directly by application code.
 *
 * @param options - Resolution options; `cwd` defaults to the current working directory.
 * @returns A Vite plugin instance.
 */
export const appTestVitePlugin = (options?: AppTestVitePluginOptions): Plugin => {
  const cwd = options?.cwd ?? process.cwd();
  const configureModulePath = resolveConfigureModulePath(cwd, options?.configureModule);

  return {
    name: 'fusion:app-test',
    resolveId(id) {
      // claim only our two virtual specifiers, leave everything else to the normal resolvers
      if (id === ENV_MODULE_ID) return RESOLVED_ENV_MODULE_ID;
      if (id === CONFIGURE_MODULE_ID) return RESOLVED_CONFIGURE_MODULE_ID;
      return null;
    },
    async load(id) {
      if (id === RESOLVED_ENV_MODULE_ID) {
        const { manifest, config } = await resolveAppTestEnv(options);
        return [
          `export const manifest = ${JSON.stringify(manifest)};`,
          `export const config = ${JSON.stringify(config)};`,
        ].join('\n');
      }
      if (id === RESOLVED_CONFIGURE_MODULE_ID) {
        // no conventional module means the app registers no extra modules, same as omitting `configure` from `makeComponent`
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
 */
const resolveConfigureModulePath = (cwd: string, file?: string): string | undefined => {
  const candidates = file ? [file] : DEFAULT_CONFIGURE_CANDIDATES;
  const found = candidates.find((candidate) => existsSync(resolve(cwd, candidate)));
  return found ? resolve(cwd, found) : undefined;
};

export default appTestVitePlugin;
