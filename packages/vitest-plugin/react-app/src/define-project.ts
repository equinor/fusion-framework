import { playwright } from '@vitest/browser-playwright';
import {
  defineProject as defineVitestProject,
  mergeConfig,
  type UserWorkspaceConfig,
} from 'vitest/config';

import { appTestVitePlugin } from './index.js';

/**
 * A config override for {@link defineProject}: an object is deep-merged onto the default
 * config via Vite's own `mergeConfig`; a function receives the default config and returns the
 * config used outright, for changes `mergeConfig` can't express (e.g. removing a field).
 */
export type AppTestConfigOverride =
  | Partial<UserWorkspaceConfig>
  | ((config: UserWorkspaceConfig) => UserWorkspaceConfig);

/**
 * Builds a ready-to-export Vitest project config for testing a Fusion Framework React app:
 * registers {@link appTestVitePlugin} (with its own defaults) and wires up Vitest browser mode
 * with the Playwright/`chromium` provider, so a consuming app's own `vitest.config.ts` needs no
 * browser-provider boilerplate of its own.
 *
 * @remarks
 * Drop-in replacement for Vitest's own `defineProject` — same `export default`, just pre-wired.
 * Playwright/`chromium` is only the *default* — pass `override` to change or replace anything
 * (e.g. `test.name`, or swap `test.browser.provider` for a different `@vitest/browser-*`
 * provider) without hand-rolling `appTestVitePlugin`'s own wiring.
 *
 * @example
 * ```ts
 * import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';
 * import { name, version } from './package.json' with { type: 'json' };
 *
 * export default defineProject({ test: { name: `${name}@${version}` } });
 * ```
 *
 * @example
 * Overriding the browser provider:
 * ```ts
 * import { webdriverio } from '@vitest/browser-webdriverio';
 *
 * export default defineProject({ test: { browser: { provider: webdriverio() } } });
 * ```
 *
 * @param override - Deep-merged onto the default config (a plain object), or applied to it
 * outright (a function receiving the default config); see {@link AppTestConfigOverride}.
 * @returns A Vitest project config, ready to `export default`.
 */
export const defineProject = (override?: AppTestConfigOverride): UserWorkspaceConfig => {
  const defaults: UserWorkspaceConfig = {
    plugins: [appTestVitePlugin()],
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      browser: {
        enabled: true,
        provider: playwright(),
        headless: true,
        instances: [{ browser: 'chromium' }],
      },
    },
    // pre-transforms all source up front so deps only reached via lazy/code-split imports
    // (e.g. route components) are discovered before the first test request, not mid-run —
    // the latter forces Vite to reload the page and fails the in-flight test file import
    server: { warmup: { clientFiles: ['src/**/*.{ts,tsx}'] } },
  };
  // a function replaces the config outright; a plain object deep-merges onto it via Vite's own mergeConfig
  const resolved =
    typeof override === 'function'
      ? override(defaults)
      : override
        ? (mergeConfig(defaults, override) as UserWorkspaceConfig)
        : defaults;
  return defineVitestProject(resolved);
};

export default defineProject;
