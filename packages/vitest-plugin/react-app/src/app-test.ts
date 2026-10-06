export {
  renderAppHook,
  type RenderAppHookOptions,
  type RenderAppHookResult,
} from './render-app-hook.js';
export {
  renderAppComponent,
  type RenderAppComponentOptions,
  type RenderAppComponentResult,
} from './render-app-component.js';
export { testApp } from './test-app.js';
export { mergeEnvConfig, type MergeEnvConfigOverrides } from './merge-env-config.js';
export type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';

// `test`/`render` import virtual modules only served once `appTestVitePlugin`
// (@equinor/fusion-framework-vitest-plugin-react-app) is registered — using any export from
// this module requires the plugin registered in your `vitest.config.ts` `plugins`.
export { test } from './test.js';
export { render } from './render.js';
