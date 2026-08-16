# Configure Fusion React app tests

The package exposes three entry points with different responsibilities:

| Import | Responsibility |
| --- | --- |
| `@equinor/fusion-framework-vitest-plugin-react-app/config` | Build a browser-ready Vitest project with `defineProject` |
| `@equinor/fusion-framework-vitest-plugin-react-app/test` | Resolve the app's files and provide `test` and `render` fixtures |
| `@equinor/fusion-framework-vitest-plugin-react-app` | Configure the Vite plugin manually or render with explicit `env`, `configure`, and `fusion` options |

## `defineProject` defaults

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

export default defineProject();
```

The default project registers `appTestVitePlugin()` and configures:

- test files under `src/**/*.{test,spec}.{ts,tsx}`
- Vitest Browser Mode enabled
- the Playwright provider with one Chromium instance
- headless browser execution
- a `1024x768` default viewport, matching a typical low-resolution Citrix session rather than
  Vitest's own mobile-sized default
- Vite warmup for `src/**/*.{ts,tsx}` to discover lazy imports before tests run

## Merge ordinary Vitest options

Pass an object to deep-merge it with the defaults through Vite's `mergeConfig`:

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';
import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    name: `${name}@${version}`,
    // opt into a wider viewport for an app that only needs to support desktop
    browser: { viewport: { width: 1920, height: 1080 } },
  },
});
```

These are standard Vitest and Vite options. Use the official Vitest configuration reference
for runner behavior rather than looking for Fusion-specific equivalents.

## Replace defaults deliberately

Pass a function only when a deep merge cannot express the change. The function's return value
replaces the defaults outright, so preserve every default the project still needs:

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

export default defineProject((defaults) => ({
  ...defaults,
  test: {
    ...defaults.test,
    include: ['tests/browser/**/*.test.tsx'],
  },
}));
```

When test files move outside `src`, update both `test.include` and `server.warmup.clientFiles`
if those tests load lazy application modules.

## Resolve non-standard app files

Use `appTestVitePlugin` directly when the app manifest, app configuration, or module
configurator does not use Fusion's normal file conventions:

```ts
import { playwright } from '@vitest/browser-playwright';
import { appTestVitePlugin } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [
    appTestVitePlugin({
      manifest: './config/app.manifest.ts',
      config: './config/app.config.ts',
      configure: './config/modules.ts',
    }),
  ],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
  server: { warmup: { clientFiles: ['src/**/*.{ts,tsx}'] } },
});
```

`entrypoint`, `manifest`, and `config` use the same resolution pipeline as `ffc app build`
and `ffc app dev`. `configure` must identify a real source file because the plugin re-exports
its live application code into the test bundle. Explicit files that do not exist throw
`FileNotFoundError`; convention-based lookups fall back to defaults.

## Choose fixtures or explicit render options

Use `/test` when the app's own files should resolve automatically. Use `renderAppHook`,
`renderAppComponent`, or `testApp` from the root entry point when the test should pass `env`,
`configure`, or a parent `fusion` instance explicitly.

- [`test` and app rendering](getting-started.md)
- [Detailed rendering and fixture APIs](../README.md#renderapphook)
- [Troubleshooting configuration](troubleshooting.md)
