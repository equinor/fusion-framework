import type { ReactElement } from 'react';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppEnv } from '@equinor/fusion-framework-app';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';

import {
  renderAppComponent,
  type RenderAppComponentOptions,
  type RenderAppComponentResult,
} from './render-app-component';

// resolved at test-time by `appTestVitePlugin` (@equinor/fusion-framework-vitest-plugin-react-app);
// see virtual-modules.d.ts for the ambient module declarations
import { manifest, config } from 'virtual:fusion-app-test-env';
import { configure } from 'virtual:fusion-app-test-configure';

/**
 * Renders a component inside the application's own module scope for use in plain `describe`/`it`
 * tests, using the manifest, config, and module-configurator resolved for this application — no
 * per-test wiring, and no custom `test` fixture required.
 *
 * @remarks
 * Requires `appTestVitePlugin` (`@equinor/fusion-framework-vitest-plugin-react-app`) registered in
 * your `vitest.config.ts` `plugins`, which serves the virtual modules backing the resolved
 * `env`/`configure`. Running the same test file without the plugin registered fails to resolve
 * those imports.
 *
 * Pass `env` or `configure` in `options` to override the resolved values for a single render.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @param ui - The component to render.
 * @param options - Overrides for `env`/`configure`, plus any other `renderAppComponent` option.
 * @returns The `render` result plus `fusion.framework` and `fusion.app`, once the mocked application module scope resolves.
 * @example
 * ```tsx
 * import { describe, expect, it } from 'vitest';
 * import { render } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
 * import { App } from '../App';
 *
 * describe('App', () => {
 *   it('renders the app', async () => {
 *     const { getByRole } = await render(<App />);
 *     await expect.element(getByRole('heading')).toBeVisible();
 *   });
 * });
 * ```
 */
export async function render<TModules extends Array<AnyModule> | unknown = unknown>(
  ui: ReactElement,
  options?: RenderAppComponentOptions<TModules, AppEnv>,
): Promise<RenderAppComponentResult<TModules>> {
  const { configure: configureOverride, env: envOverride, ...renderOptions } = options ?? {};
  return renderAppComponent<TModules, AppEnv>(ui, {
    ...renderOptions,
    env: envOverride ?? { manifest, config },
    // the resolved `configure` is generic over the app's own module set (`unknown`), while
    // `TModules` here is caller-supplied *extra* modules — safe to widen for the common case
    // where callers don't override it with a `TModules`-specific configurator
    configure: (configureOverride ?? configure) as AppMockConfigureFn<TModules, AppEnv> | undefined,
  });
}

export default render;
