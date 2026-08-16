export {
  renderAppHook,
  type RenderAppHookOptions,
  type RenderAppHookResult,
} from './render-app-hook';
export {
  renderAppComponent,
  type RenderAppComponentOptions,
  type RenderAppComponentResult,
} from './render-app-component';
export { testApp } from './test-app';
export type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';

// `test`/`render` import virtual modules only served once `appTestVitePlugin`
// (@equinor/fusion-framework-vitest-plugin-react-app) is registered — using any export from
// this module requires the plugin registered in your `vitest.config.ts` `plugins`.
export { test } from './test';
export { render } from './render';
