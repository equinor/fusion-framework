/**
 * Testing utilities for `@equinor/fusion-framework-cli/vitest`.
 *
 * Resolves an application's manifest and config using the same pipeline `ffc app build`/
 * `ffc app dev` use, for seeding test fixtures.
 *
 * @packageDocumentation
 */
export {
  resolveAppTestEnv,
  type AppTestEnv,
  type ResolveAppTestEnvOptions,
} from './resolve-app-test-env.js';
export { appTestVitePlugin, type AppTestVitePluginOptions } from './app-test-vite-plugin.js';
